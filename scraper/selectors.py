"""
CSS selectors and parsing config for carsensor.net listing pages.
Last verified: 2026-06-09
"""

SELECTORS = {
    # Each search result is a cassette div with a stable listing ID suffix.
    "car_card": "div.cassette.js_listTableCassette",

    # The main listing title link inside the car information column.
    "title_ja": ".cassetteMain__title .cassetteMain__link",

    # Year is stored in a specList__detailBox whose dt label is "年式".
    "year": ".specList__detailBox",

    # Mileage is stored in a specList__detailBox whose dt label is "走行距離".
    "mileage": ".specList__detailBox",

    # Vehicle base price; total price is used as a fallback when base is absent.
    "price": ".basePrice__content, .totalPrice__content",

    # No separate grade field is exposed on current listing cards; derive from title.
    "grade": ".cassetteMain__title .cassetteMain__link",

    # The second body info list item contains the color text.
    "color": ".carBodyInfoList__item",

    # First car image in the main image block, usually inside noscript markup.
    "thumbnail": ".cassetteMain__mainImg img",

    # Primary detail page link for the listing.
    "detail_url": ".cassetteMain__title .cassetteMain__link",
}

# Base URL for constructing absolute links
BASE_URL = "https://www.carsensor.net"

# Current Carsensor listing IDs are commonly AU..., while older examples used CS...
SOURCE_ID_PATTERN = r"/detail/([A-Z]{2}\w+)/"
