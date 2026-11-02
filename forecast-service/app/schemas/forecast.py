from datetime import datetime, timezone
from typing import List, Literal, Optional
from pydantic import BaseModel, Field, model_validator


ForecastMethod = Literal[
    "auto",
    "linear_trend",
    "moving_average",
    "exponential_smoothing",
]


class HistoricalDataPoint(BaseModel):
    date: str = Field(..., description="Date or month string, e.g. '2026-01' or '2026-01-15'")
    amount: float = Field(..., description="Monetary value for this period")
    category: Optional[str] = Field(None, description="Optional category label")


class ForecastRequest(BaseModel):
    historical_data: List[HistoricalDataPoint] = Field(
        ...,
        min_length=1,
        description="Chronological or dated historical financial records",
    )
    periods: int = Field(
        default=3,
        ge=1,
        le=24,
        description="Number of future periods (months/intervals) to predict",
    )
    method: ForecastMethod = Field(
        default="auto",
        description="Forecasting method to apply",
    )
    confidence_level: float = Field(
        default=0.95,
        gt=0.0,
        lt=1.0,
        description="Confidence interval for upper and lower bounds",
    )
    non_negative: bool = Field(
        default=True,
        description="Whether to clamp negative predictions to 0.0 (e.g. for expenses)",
    )

    @model_validator(mode="after")
    def validate_historical_data(self) -> "ForecastRequest":
        if not self.historical_data:
            raise ValueError("historical_data cannot be empty")
        return self


class ForecastDataPoint(BaseModel):
    period_index: int = Field(..., description="1-based forecast step index")
    date: str = Field(..., description="Projected period/month string")
    predicted_amount: float = Field(..., description="Forecasted amount")
    lower_bound: float = Field(..., description="Lower confidence bound")
    upper_bound: float = Field(..., description="Upper confidence bound")


class ForecastMetrics(BaseModel):
    mean_historical: float = Field(..., description="Average historical value")
    trend: str = Field(..., description="'increasing', 'decreasing', or 'stable'")
    growth_rate_pct: float = Field(..., description="Projected period-over-period growth rate (%)")
    volatility: float = Field(..., description="Historical standard deviation")
    r_squared: Optional[float] = Field(None, description="Goodness of fit (0 to 1) for linear models")


class ForecastResponse(BaseModel):
    method_used: str = Field(..., description="Algorithm applied for the forecast")
    periods_forecasted: int = Field(..., description="Number of forecasted steps")
    forecast: List[ForecastDataPoint] = Field(..., description="List of forecasted points with bounds")
    metrics: ForecastMetrics = Field(..., description="Summary statistical metrics")
    insights: List[str] = Field(default_factory=list, description="Actionable financial observations")


class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str = "forecast-service"
    version: str = "0.1.0"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
