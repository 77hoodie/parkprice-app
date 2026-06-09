from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_recommend_endpoint():
    response = client.post(
        "/recommend",
        json={
            "base_rate": 8.0,
            "occupancy": 90,
            "demand": 8.5,
            "event_level": 8.0,
            "avg_stay_minutes": 150,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["recommended_rate"] > 0
    assert payload["label"] in {"discount", "normal", "moderate", "high", "critical"}


def test_simulate_endpoint():
    response = client.post("/simulate", json={})
    assert response.status_code == 200
    payload = response.json()
    assert len(payload["summary"]) >= 3
    assert len(payload["rows"]) > 0


def test_fuzzy_sensitivity_endpoint():
    response = client.post(
        "/analysis/fuzzy-sensitivity",
        json={
            "variable": "occupancy",
            "steps": 7,
            "base_input": {
                "base_rate": 8.0,
                "occupancy": 50,
                "demand": 5,
                "event_level": 2,
                "avg_stay_minutes": 90,
            },
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["variable"] == "occupancy"
    assert len(payload["rows"]) == 7


def test_optimize_accepts_editable_parameters():
    response = client.post(
        "/optimize",
        json={
            "population_size": 8,
            "generations": 2,
            "seed": 1,
            "crossover_probability": 0.7,
            "mutation_probability": 0.2,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert "performance" in payload
    assert payload["parameters"]["population_size"] == 8
