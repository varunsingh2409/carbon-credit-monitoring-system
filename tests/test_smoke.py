from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root_endpoint_returns_basic_api_metadata() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "Carbon Credit API", "version": "1.0"}


def test_health_endpoint_reports_ok() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
