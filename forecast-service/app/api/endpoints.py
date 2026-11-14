import os
import secrets

from fastapi import APIRouter, HTTPException, status , Header , Depends
from app.schemas.forecast import ForecastRequest, ForecastResponse, HealthResponse
from app.services.forecaster import forecaster
from app.core.config import settings

router = APIRouter(tags=["Forecasting"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check endpoint",
    description="Returns the operational status, service name, and version of the forecast service.",
)
async def health_check() -> HealthResponse:
    return HealthResponse()

def verify_internal_key(x_internal_key: str = Header(...)):
    # Use compare_digest to prevent timing attacks
    if not secrets.compare_digest(x_internal_key, settings.INTERNAL_KEY):
        raise HTTPException(status_code=403, detail="Invalid internal key")


    """_summary_

    Raises:
        HTTPException: _description_
        HTTPException: _description_

    Returns:
        _type_: _description_
    """
@router.post(
    "/predict",
    dependencies=[Depends(verify_internal_key)],
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

