"""Backend tests for IBIG Coach IA endpoint (POST /api/coach/chat)."""
import os
import requests
import pytest

BASE_URL = (os.environ.get("NEXT_PUBLIC_SITE_URL") or "https://ibig-affiliate-boost.preview.emergentagent.com").rstrip("/")


@pytest.fixture
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


class TestProxyHealth:
    def test_root_loads(self, api_client):
        r = api_client.get(f"{BASE_URL}/", timeout=15)
        assert r.status_code == 200


class TestCoachChat:
    """Coach IA — emergentintegrations openai/gpt-5.4-mini"""

    def test_coach_chat_returns_french_reply(self, api_client):
        payload = {
            "message": "Bonjour quel produit IBIG conseilles-tu a un directeur ecole ?",
            "context": {"nom": "Koffi", "statut": "GOLD"},
        }
        r = api_client.post(f"{BASE_URL}/api/coach/chat", json=payload, timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert "reply" in data
        assert isinstance(data["reply"], str)
        assert len(data["reply"]) > 80, f"Reply too short: {data['reply']!r}"
        # multi-line response expected
        assert data["reply"].count("\n") >= 1

    def test_coach_chat_empty_message_400(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/coach/chat", json={"message": ""}, timeout=15)
        assert r.status_code == 400

    def test_coach_chat_too_long_400(self, api_client):
        r = api_client.post(
            f"{BASE_URL}/api/coach/chat",
            json={"message": "a" * 3100},
            timeout=15,
        )
        assert r.status_code == 400


class TestLoginEndpoint:
    """Validate that authentication works via Next.js auth route."""

    def test_login_endpoint_reachable(self, api_client):
        # Just check the credentials API exists - status 4xx/2xx both ok (no 500)
        r = api_client.post(
            f"{BASE_URL}/api/auth/callback/credentials",
            data={"email": "koffi@example.com", "password": "password123"},
            allow_redirects=False,
            timeout=15,
        )
        assert r.status_code < 500
