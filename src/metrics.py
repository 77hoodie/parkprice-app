from __future__ import annotations

import pandas as pd


def summarize_comparison(comparison: pd.DataFrame) -> pd.DataFrame:
    summary = (
        comparison.groupby("strategy")
        .agg(
            average_price=("price", "mean"),
            total_revenue=("revenue_estimate", "sum"),
            average_revenue=("revenue_estimate", "mean"),
        )
        .reset_index()
    )

    for column in ["average_price", "total_revenue", "average_revenue"]:
        summary[column] = summary[column].round(2)

    return summary
