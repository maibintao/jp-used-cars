"""
Converts JPY prices to USD and adds shipping cost.
"""

from __future__ import annotations

import requests

from .vocabulary import lookup  # noqa: F401 - import pattern used by processor modules


_cached_rate: float | None = None
FALLBACK_RATE = 0.0067
RATE_URL = "https://api.exchangerate-api.com/v4/latest/JPY"


def get_live_rate() -> float:
    """
    Fetch live JPY->USD rate from exchangerate-api.com.
    Caches the result for the duration of the process.
    Falls back to 0.0067 if the request fails.
    """
    global _cached_rate
    if _cached_rate is not None:
        return _cached_rate

    try:
        response = requests.get(RATE_URL, timeout=10)
        response.raise_for_status()
        rate = float(response.json()["rates"]["USD"])
    except Exception:
        rate = FALLBACK_RATE

    _cached_rate = rate
    return rate


def convert_price(price_jpy: int | None, shipping_usd: int) -> dict:
    """
    Convert a JPY price to USD and compute total with shipping.

    Args:
        price_jpy: Price in full JPY, or None
        shipping_usd: Shipping cost in USD from config
    """
    rate = get_live_rate()
    price_usd = None if price_jpy is None else round(price_jpy * rate / 100) * 100
    total_usd = None if price_usd is None else price_usd + shipping_usd

    return {
        "price_usd": price_usd,
        "shipping_usd": shipping_usd,
        "total_usd": total_usd,
        "exchange_rate": rate,
    }


def process_car_price(car: dict, config: dict) -> dict:
    """
    Add price fields to a car dict. Reads shipping from config.yaml.

    Adds: price_usd, shipping_usd, total_usd, exchange_rate
    """
    shipping_usd = config.get("shipping", {}).get("default_usd", 2500)
    price_data = convert_price(car.get("price_jpy"), shipping_usd)
    return {**car, **price_data}
