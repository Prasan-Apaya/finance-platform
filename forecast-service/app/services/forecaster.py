import math
from typing import List, Tuple
import numpy as np
import pandas as pd

from app.schemas.forecast import (
    ForecastDataPoint,
    ForecastMetrics,
    ForecastRequest,
    ForecastResponse,
    HistoricalDataPoint,
)


class FinancialForecaster:
    """Pure mathematical and statistical forecasting engine using NumPy and Pandas."""

    @staticmethod
    def _parse_dates(raw_dates: List[str]) -> Tuple[List[str], str]:
        """Detect date format and return parsed dates and the inferred cadence/format."""
        if not raw_dates:
            return [], "sequential"

        sample = raw_dates[-1].strip()
        is_year_month = len(sample) == 7 and sample[4] == "-" and sample[:4].isdigit() and sample[5:7].isdigit()
        is_full_date = len(sample) == 10 and sample[4] == "-" and sample[7] == "-"

        if is_year_month:
            return raw_dates, "monthly"
        elif is_full_date:
            return raw_dates, "daily"
        else:
            try:
                pd.to_datetime(raw_dates)
                return raw_dates, "datetime"
            except Exception:
                return raw_dates, "sequential"

    @classmethod
    def _generate_future_dates(cls, last_date_str: str, periods: int, cadence: str) -> List[str]:
        """Generate consecutive future date labels matching the input series."""
        future_labels = []
        try:
            if cadence == "monthly":
                last_dt = pd.to_datetime(last_date_str, format="%Y-%m")
                for i in range(1, periods + 1):
                    next_dt = last_dt + pd.DateOffset(months=i)
                    future_labels.append(next_dt.strftime("%Y-%m"))
                return future_labels
            elif cadence in ("daily", "datetime"):
                last_dt = pd.to_datetime(last_date_str)
                for i in range(1, periods + 1):
                    next_dt = last_dt + pd.DateOffset(months=1)
                    future_labels.append(next_dt.strftime("%Y-%m-%d"))
                return future_labels
        except Exception:
            pass

        # Fallback to sequential period labels
        for i in range(1, periods + 1):
            future_labels.append(f"Period +{i}")
        return future_labels

    @staticmethod
    def _get_critical_z(confidence_level: float) -> float:
        """Approximate two-tailed normal critical value z for a given confidence level."""
        # Common critical values
        if confidence_level >= 0.99:
            return 2.576
        elif confidence_level >= 0.95:
            return 1.960
        elif confidence_level >= 0.90:
            return 1.645
        elif confidence_level >= 0.80:
            return 1.282
        # General approximation for normal quantile
        p = 1.0 - (1.0 - confidence_level) / 2.0
        # Hastings approximation for inverse CDF
        t = math.sqrt(-2.0 * math.log(1.0 - p))
        c0, c1, c2 = 2.515517, 0.802853, 0.010328
        d1, d2, d3 = 1.432788, 0.189269, 0.001308
        z = t - ((c2 * t + c1) * t + c0) / (((d3 * t + d2) * t + d1) * t + 1.0)
        return float(z)

    def forecast_linear(
        self,
        values: np.ndarray,
        periods: int,
        confidence_level: float,
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, float, float, float]:
        """
        Fit linear trend y = a * x + b using ordinary least squares.
        Returns:
            predicted, lower_bounds, upper_bounds, slope, intercept, r_squared
        """
        n = len(values)
        x = np.arange(n, dtype=float)
        y = values.astype(float)

        if n == 1:
            val = float(values[0])
            preds = np.full(periods, val)
            margin = abs(val) * 0.1 if val != 0 else 10.0
            return preds, preds - margin, preds + margin, 0.0, val, 1.0

        # OLS fit
        slope, intercept = np.polyfit(x, y, deg=1)
        fitted = slope * x + intercept
        residuals = y - fitted

        # Variance & Standard Error
        ss_res = np.sum(residuals**2)
        ss_tot = np.sum((y - np.mean(y)) ** 2)
        r_squared = 1.0 - (ss_res / ss_tot) if ss_tot > 1e-9 else 1.0
        r_squared = max(0.0, min(1.0, float(r_squared)))

        dof = max(1, n - 2)
        se_residual = math.sqrt(ss_res / dof) if ss_res > 0 else 0.0
        x_mean = np.mean(x)
        ss_x = np.sum((x - x_mean) ** 2)
        z = self._get_critical_z(confidence_level)

        future_x = np.arange(n, n + periods, dtype=float)
        predicted = slope * future_x + intercept

        # Prediction interval standard error increases further into the future
        if ss_x > 0:
            se_pred = se_residual * np.sqrt(1.0 + (1.0 / n) + ((future_x - x_mean) ** 2) / ss_x)
        else:
            se_pred = np.full(periods, se_residual)

        margin = z * se_pred
        lower_bounds = predicted - margin
        upper_bounds = predicted + margin

        return predicted, lower_bounds, upper_bounds, float(slope), float(intercept), r_squared

    def forecast_exponential_smoothing(
        self,
        values: np.ndarray,
        periods: int,
        confidence_level: float,
        alpha: float = 0.4,
        beta: float = 0.2,
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, float]:
        """
        Holt's Linear Exponential Smoothing (level + trend).
        """
        n = len(values)
        if n == 1:
            val = float(values[0])
            preds = np.full(periods, val)
            margin = abs(val) * 0.1 if val != 0 else 10.0
            return preds, preds - margin, preds + margin, 0.0

        level = float(values[0])
        trend = float(values[1] - values[0]) if n > 1 else 0.0

        residuals = []
        for i in range(n):
            val = float(values[i])
            last_level = level
            level = alpha * val + (1.0 - alpha) * (last_level + trend)
            trend = beta * (level - last_level) + (1.0 - beta) * trend
            pred_point = last_level + trend
            residuals.append(val - pred_point)

        future_steps = np.arange(1, periods + 1, dtype=float)
        predicted = level + future_steps * trend

        res_std = float(np.std(residuals)) if len(residuals) > 1 else float(np.std(values))
        z = self._get_critical_z(confidence_level)
        margin = z * res_std * np.sqrt(future_steps)

        lower_bounds = predicted - margin
        upper_bounds = predicted + margin

        return predicted, lower_bounds, upper_bounds, trend

    def forecast_moving_average(
        self,
        values: np.ndarray,
        periods: int,
        confidence_level: float,
        window: int = 3,
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, float]:
        """
        Rolling moving average with linear trend dampening.
        """
        n = len(values)
        actual_window = min(window, n)
        recent = values[-actual_window:]
        rolling_mean = float(np.mean(recent))

        # Estimate gentle momentum from the last window
        if len(recent) > 1:
            slope = float(np.polyfit(np.arange(len(recent)), recent, 1)[0])
        else:
            slope = 0.0

        future_steps = np.arange(1, periods + 1, dtype=float)
        # Apply slight dampening on momentum
        dampening = 0.85 ** future_steps
        predicted = rolling_mean + slope * future_steps * dampening

        std_dev = float(np.std(values)) if n > 1 else float(values[0] * 0.1)
        z = self._get_critical_z(confidence_level)
        margin = z * std_dev * np.sqrt(future_steps)

        lower_bounds = predicted - margin
        upper_bounds = predicted + margin

        return predicted, lower_bounds, upper_bounds, slope

    def predict(self, request: ForecastRequest) -> ForecastResponse:
        """Main forecasting execution endpoint."""
        # Convert historical data to pandas DataFrame
        df = pd.DataFrame([dp.model_dump() for dp in request.historical_data])
        raw_dates = df["date"].astype(str).tolist()
        values = df["amount"].to_numpy(dtype=float)

        n = len(values)
        mean_val = float(np.mean(values))
        volatility = float(np.std(values)) if n > 1 else 0.0

        # Parse date progression
        cleaned_dates, cadence = self._parse_dates(raw_dates)
        last_date = cleaned_dates[-1] if cleaned_dates else "2026-01"
        future_date_labels = self._generate_future_dates(last_date, request.periods, cadence)

        # Method selection
        method = request.method
        if method == "auto":
            if n >= 3:
                # Test linear regression R-squared
                _, _, _, _, _, r2 = self.forecast_linear(values, request.periods, request.confidence_level)
                method_used = "linear_trend" if r2 >= 0.35 else "exponential_smoothing"
            elif n == 2:
                method_used = "linear_trend"
            else:
                method_used = "exponential_smoothing"
        else:
            method_used = method

        r_squared = None

        if method_used == "linear_trend":
            predicted, lowers, uppers, slope, _, r2 = self.forecast_linear(
                values, request.periods, request.confidence_level
            )
            r_squared = r2
            growth_rate_pct = (slope / mean_val * 100.0) if abs(mean_val) > 1e-5 else 0.0
        elif method_used == "exponential_smoothing":
            predicted, lowers, uppers, trend_slope = self.forecast_exponential_smoothing(
                values, request.periods, request.confidence_level
            )
            growth_rate_pct = (trend_slope / mean_val * 100.0) if abs(mean_val) > 1e-5 else 0.0
        elif method_used == "moving_average":
            predicted, lowers, uppers, ma_slope = self.forecast_moving_average(
                values, request.periods, request.confidence_level
            )
            growth_rate_pct = (ma_slope / mean_val * 100.0) if abs(mean_val) > 1e-5 else 0.0
        else:
            predicted, lowers, uppers, slope, _, r_squared = self.forecast_linear(
                values, request.periods, request.confidence_level
            )
            growth_rate_pct = (slope / mean_val * 100.0) if abs(mean_val) > 1e-5 else 0.0

        # Post-processing: Non-negative clamping & bound consistency
        if request.non_negative:
            predicted = np.maximum(0.0, predicted)
            lowers = np.maximum(0.0, lowers)
            uppers = np.maximum(0.0, uppers)

        # Ensure lower <= pred <= upper
        lowers = np.minimum(lowers, predicted)
        uppers = np.maximum(uppers, predicted)

        # Assemble forecast points
        forecast_points: List[ForecastDataPoint] = []
        for idx in range(request.periods):
            forecast_points.append(
                ForecastDataPoint(
                    period_index=idx + 1,
                    date=future_date_labels[idx],
                    predicted_amount=round(float(predicted[idx]), 2),
                    lower_bound=round(float(lowers[idx]), 2),
                    upper_bound=round(float(uppers[idx]), 2),
                )
            )

        # Trend categorization
        if growth_rate_pct > 2.0:
            trend_label = "increasing"
        elif growth_rate_pct < -2.0:
            trend_label = "decreasing"
        else:
            trend_label = "stable"

        # Actionable insights generation
        insights: List[str] = []
        first_pred = forecast_points[0].predicted_amount
        last_pred = forecast_points[-1].predicted_amount

        if trend_label == "increasing":
            insights.append(
                f"Projected {growth_rate_pct:.1f}% period-over-period growth. "
                f"Expenses expected to reach ${last_pred:,.2f}."
            )
        elif trend_label == "decreasing":
            insights.append(
                f"Spending is trending downwards by {abs(growth_rate_pct):.1f}% per period, "
                f"falling to ~${last_pred:,.2f}."
            )
        else:
            insights.append(
                f"Spending is relatively stable around a mean of ${mean_val:,.2f} per period."
            )

        if volatility > 0 and mean_val > 0:
            cv = (volatility / mean_val) * 100.0
            if cv > 30.0:
                insights.append(f"High historical volatility observed (std dev: ${volatility:,.2f}, {cv:.1f}% CV).")
            else:
                insights.append(f"Spending consistency is good with low deviation (${volatility:,.2f}).")

        if r_squared is not None:
            insights.append(f"Model goodness of fit (R²): {r_squared:.2f}.")

        metrics = ForecastMetrics(
            mean_historical=round(mean_val, 2),
            trend=trend_label,
            growth_rate_pct=round(growth_rate_pct, 2),
            volatility=round(volatility, 2),
            r_squared=round(r_squared, 3) if r_squared is not None else None,
        )

        return ForecastResponse(
            method_used=method_used,
            periods_forecasted=request.periods,
            forecast=forecast_points,
            metrics=metrics,
            insights=insights,
        )


forecaster = FinancialForecaster()

