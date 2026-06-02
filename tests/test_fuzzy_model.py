from src.fuzzy_model import ParkingInputs, RULES, recommend_price


def test_recommend_price_returns_expected_fields():
    result = recommend_price(
        ParkingInputs(
            base_rate=8.0,
            occupancy=80,
            demand=8,
            event_level=5,
            avg_stay_minutes=120,
        )
    )

    assert "recommended_rate" in result
    assert "multiplier" in result
    assert result["recommended_rate"] > 0
    assert 0.7 <= result["multiplier"] <= 1.8


def test_rule_count_stays_visible():
    assert len(RULES) >= 12
