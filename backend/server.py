"""
IBIG PARTNERS — Reverse proxy FastAPI + Coach IA endpoint.
- /api/coach/* : géré DIRECTEMENT par Python (utilise emergentintegrations)
- /api/* (autre) : forwarde vers Next.js sur le port 3000
"""
import os
import asyncio
from typing import List, Dict, Optional
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx

load_dotenv("/app/frontend/.env")
load_dotenv("/app/backend/.env")

NEXT_URL = "http://localhost:3000"
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

app = FastAPI()

# Client HTTP réutilisable (pool)
client = httpx.AsyncClient(base_url=NEXT_URL, timeout=httpx.Timeout(60.0, connect=10.0))


@app.on_event("shutdown")
async def shutdown():
    await client.aclose()


@app.get("/healthz")
async def healthz():
    return {"ok": True, "service": "ibig-proxy"}


# ─── COACH IA ──────────────────────────────────────────────────────────────
COACH_SYSTEM_PROMPT = """Tu es le Coach IA personnel d'un partenaire affilié IBIG PARTNERS (groupe IBIG SARL, Abidjan).

Tu génères des messages, conseils et stratégies HYPER-PERSONNALISÉS pour aider le partenaire à VENDRE et RECRUTER plus.

Ton style :
- Direct, motivant, sans bullshit
- Toujours en FRANÇAIS (parfois quelques expressions ivoiriennes naturelles)
- Concret avec des chiffres et des étapes actionnables
- Tu utilises les émojis avec parcimonie (1-3 max par réponse)

Tes capacités :
1. Générer des messages WhatsApp/Facebook personnalisés pour différents profils de prospects
2. Suggérer le meilleur produit IBIG à proposer selon le contexte du prospect
3. Donner des conseils chiffrés basés sur la situation du partenaire
4. Rédiger des relances polies après silence radio
5. Préparer un pitch pour rendez-vous

Connaissances :
- Produits IBIG : Scolaby (gestion scolaire 30k FCFA/mois), Suite RH SaaS, IBIG IMMO TRUST (immobilier), formations IBIG EDUFORM, IBIG MARKET
- Commissions 3 niveaux : N1 plein, N2 = 50% du N1, N3 = 25% du N1
- Bonus statut : Silver +2%, Gold +5%, Master +8%, Elite +12%
- Paiement Mobile Money 7 jours après vente confirmée

Sois bref, percutant, prêt-à-copier."""


class CoachMessage(BaseModel):
    role: str
    content: str


class CoachRequest(BaseModel):
    message: str
    history: Optional[List[CoachMessage]] = []
    context: Optional[Dict[str, str]] = {}  # ex: {"status":"GOLD","city":"Abidjan"}


@app.post("/api/coach/chat")
async def coach_chat(req: CoachRequest):
    """Endpoint coach IA — utilise EMERGENT_LLM_KEY via emergentintegrations."""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(500, "EMERGENT_LLM_KEY non configurée")

    if not req.message.strip():
        raise HTTPException(400, "Message vide")
    if len(req.message) > 3000:
        raise HTTPException(400, "Message trop long (>3000 caractères)")

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage  # type: ignore
    except ImportError:
        raise HTTPException(500, "emergentintegrations non installée")

    # Contexte partenaire injecté au système prompt
    ctx_lines = []
    if req.context:
        for k, v in req.context.items():
            ctx_lines.append(f"- {k}: {v}")
    ctx_str = "\n".join(ctx_lines) if ctx_lines else "(aucun contexte fourni)"
    system = f"{COACH_SYSTEM_PROMPT}\n\nContexte du partenaire qui te parle :\n{ctx_str}"

    # Session ID basé sur taille historique pour éviter cache stale
    session_id = f"coach-{abs(hash(req.message))}"

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system,
    ).with_model("openai", "gpt-5.4-mini")

    # Envoyer l'historique court (réponse non streamée pour simplicité côté Next.js)
    history_text = ""
    if req.history:
        for h in req.history[-6:]:
            tag = "Partenaire" if h.role == "user" else "Coach"
            history_text += f"{tag} : {h.content}\n\n"

    full_message = f"{history_text}Partenaire : {req.message}" if history_text else req.message

    try:
        reply_text = ""
        from emergentintegrations.llm.chat import TextDelta, StreamDone  # type: ignore
        async for ev in chat.stream_message(UserMessage(text=full_message)):
            if isinstance(ev, TextDelta):
                reply_text += ev.content
            elif isinstance(ev, StreamDone):
                break
        return {"reply": reply_text or "Désolé, pas de réponse générée. Reformulez votre question."}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": "Erreur Coach IA", "detail": str(e)[:300]},
        )


# ─── REVERSE PROXY POUR TOUT LE RESTE ──────────────────────────────────────
@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
)
async def proxy_api(path: str, request: Request):
    """Forwarde toute requête /api/* (hors /api/coach/*) vers Next.js."""
    target_path = f"/api/{path}"
    if request.url.query:
        target_path = f"{target_path}?{request.url.query}"

    headers = {
        k: v
        for k, v in request.headers.items()
        if k.lower() not in ("host", "content-length", "transfer-encoding", "connection")
    }

    body = await request.body()

    try:
        upstream = await client.request(
            request.method,
            target_path,
            headers=headers,
            content=body,
        )
    except httpx.ConnectError:
        return JSONResponse(
            status_code=503,
            content={"error": "Next.js server unreachable", "detail": "Service is starting"},
        )

    response_headers = {
        k: v
        for k, v in upstream.headers.items()
        if k.lower() not in ("content-encoding", "content-length", "transfer-encoding", "connection")
    }

    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=response_headers,
    )
