from fastapi import APIRouter, HTTPException, status
from app.schemas.forecast import ForecastRequest, ForecastResponse, HealthResponse
from app.services.forecaster import forecaster

router = APIRouter(tags=["Forecasting"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check endpoint",
    description="Returns the operational status, service name, and version of the forecast service.",
)
async def health_check() -> HealthResponse:
    return HealthResponse()


@router.post(
    "/predict",
    response_model=ForecastResponse,
    summary="Generate time series financial forecast",
    description="Calculates projections and confidence bounds using statistical algorithms (OLS, Holt's linear, Moving Average).",
)
async def predict_forecast(request: ForecastRequest) -> ForecastResponse:
    try:
        response = forecaster.predict(request)
        return response
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Forecasting engine error: {str(exc)}",
        )

