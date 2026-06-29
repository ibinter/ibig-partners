"""
IBIG PARTNERS — Reverse proxy FastAPI uniquement utilisé en environnement Emergent preview.
Sur Vercel (production), Next.js gère tout nativement (y compris /api/coach via Node.js).

Ce fichier forwarde toutes les requêtes /api/* vers Next.js (port 3000)
car l'ingress Kubernetes d'Emergent redirige /api/* vers le port 8001.
"""
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
import httpx

NEXT_URL = "http://localhost:3000"

app = FastAPI()
client = httpx.AsyncClient(base_url=NEXT_URL, timeout=httpx.Timeout(60.0, connect=10.0))


@app.on_event("shutdown")
async def shutdown():
    await client.aclose()


@app.get("/healthz")
async def healthz():
    return {"ok": True, "service": "ibig-proxy"}


@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
)
async def proxy_api(path: str, request: Request):
    """Forwarde toute requête /api/* vers Next.js."""
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
            content={"error": "Next.js server unreachable"},
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
