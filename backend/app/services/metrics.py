from __future__ import annotations

import pandas as pd


def summarize_comparison(comparison: pd.DataFrame) -> pd.DataFrame:
    summary = (
        comparison.groupby("strategy")
        .agg(
            average_price=("price", "mean"),
            average_multiplier=("multiplier", "mean"),
            total_revenue=("revenue_estimate", "sum"),
            average_revenue=("revenue_estimate", "mean"),
            average_predicted_occupancy=("predicted_occupancy", "mean"),
            average_turnover=("turnover_index", "mean"),
        )
        .reset_index()
    )

    for column in summary.columns:
        if column != "strategy":
            summary[column] = summary[column].round(2)
    return summary


def dataframe_to_records(df: pd.DataFrame) -> list[dict]:
    return df.where(pd.notnull(df), None).to_dict(orient="records")
