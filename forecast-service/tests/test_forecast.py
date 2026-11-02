import pytest
from fastapi.testclient import TestClient
import numpy as np

from main import app
from app.services.forecaster import FinancialForecaster, forecaster
from app.schemas.forecast import ForecastRequest, HistoricalDataPoint


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def sample_monthly_data():
    return [
        {"date": "2026-01", "amount": 1000.0},
        {"date": "2026-02", "amount": 1100.0},
        {"date": "2026-03", "amount": 1250.0},
        {"date": "2026-04", "amount": 1300.0},
        {"date": "2026-05", "amount": 1420.0},
        {"date": "2026-06", "amount": 1500.0},
    ]


# ---------------------------------------------------------------------------
# API Endpoint Tests
# ---------------------------------------------------------------------------

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "forecast-service"
    assert "timestamp" in data


def test_api_v1_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["predict"] == "/predict"


def test_predict_auto(client, sample_monthly_data):
    payload = {
        "historical_data": sample_monthly_data,
        "periods": 3,
        "method": "auto",
        "confidence_level": 0.95,
        "non_negative": True,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["periods_forecasted"] == 3
    assert len(data["forecast"]) == 3
    assert data["metrics"]["trend"] == "increasing"
    assert data["metrics"]["growth_rate_pct"] > 0
    assert len(data["insights"]) > 0

    # Check future dates progression
    dates = [p["date"] for p in data["forecast"]]
    assert dates == ["2026-07", "2026-08", "2026-09"]

    # Verify bounds consistency
    for point in data["forecast"]:
        assert point["lower_bound"] <= point["predicted_amount"]
        assert point["predicted_amount"] <= point["upper_bound"]
        assert point["predicted_amount"] > 0


def test_predict_methods(client, sample_monthly_data):
    for method in ["linear_trend", "exponential_smoothing", "moving_average"]:
        payload = {
            "historical_data": sample_monthly_data,
            "periods": 2,
            "method": method,
        }
        response = client.post("/predict", json=payload)
        assert response.status_code == 200, f"Method {method} failed"
        data = response.json()
        assert data["method_used"] == method
        assert len(data["forecast"]) == 2


# ---------------------------------------------------------------------------
# Edge Cases & Validation Tests
# ---------------------------------------------------------------------------

def test_single_historical_point(client):
    payload = {
        "historical_data": [{"date": "2026-01", "amount": 500.0}],
        "periods": 3,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["forecast"]) == 3
    for p in data["forecast"]:
        assert p["predicted_amount"] == 500.0
        assert p["lower_bound"] <= 500.0 <= p["upper_bound"]


def test_constant_identical_values(client):
    payload = {
        "historical_data": [
            {"date": "2026-01", "amount": 800.0},
            {"date": "2026-02", "amount": 800.0},
            {"date": "2026-03", "amount": 800.0},
        ],
        "periods": 2,
        "method": "linear_trend",
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["metrics"]["trend"] == "stable"
    for p in data["forecast"]:
        assert abs(p["predicted_amount"] - 800.0) < 1e-2


def test_downward_trend_with_non_negative_clamp(client):
    # Rapidly plummeting expenses should be clamped at 0.0
    payload = {
        "historical_data": [
            {"date": "2026-01", "amount": 500.0},
            {"date": "2026-02", "amount": 250.0},
            {"date": "2026-03", "amount": 50.0},
        ],
        "periods": 4,
        "method": "linear_trend",
        "non_negative": True,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["metrics"]["trend"] == "decreasing"
    for p in data["forecast"]:
        assert p["predicted_amount"] >= 0.0
        assert p["lower_bound"] >= 0.0


def test_empty_historical_data_rejected(client):
    payload = {
        "historical_data": [],
        "periods": 3,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422


def test_invalid_periods_rejected(client):
    payload = {
        "historical_data": [{"date": "2026-01", "amount": 100.0}],
        "periods": 0,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# Pure Math & Unit Function Tests on FinancialForecaster
# ---------------------------------------------------------------------------

def test_linear_regression_math():
    forecaster_engine = FinancialForecaster()
    # Perfect linear slope of +10: y = 10 * x + 50
    x = np.arange(5)
    y = 10.0 * x + 50.0

    preds, lower, upper, slope, intercept, r2 = forecaster_engine.forecast_linear(
        y, periods=3, confidence_level=0.95
    )

    assert abs(slope - 10.0) < 1e-4
    assert abs(intercept - 50.0) < 1e-4
    assert abs(r2 - 1.0) < 1e-4
    np.testing.assert_allclose(preds, [100.0, 110.0, 120.0], rtol=1e-3)


def test_exponential_smoothing_math():
    forecaster_engine = FinancialForecaster()
    values = np.array([100.0, 120.0, 140.0, 160.0])
    preds, lower, upper, trend = forecaster_engine.forecast_exponential_smoothing(
        values, periods=2, confidence_level=0.95
    )
    assert len(preds) == 2
    assert preds[1] > preds[0]
    assert np.all(lower <= preds)
    assert np.all(preds <= upper)


def test_moving_average_math():
    forecaster_engine = FinancialForecaster()
    values = np.array([200.0, 210.0, 220.0, 230.0])
    preds, lower, upper, slope = forecaster_engine.forecast_moving_average(
        values, periods=3, confidence_level=0.95
    )
    assert len(preds) == 3
    assert np.all(lower <= preds)
    assert np.all(preds <= upper)
