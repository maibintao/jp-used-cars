"""
Translates Japanese car listing fields to English.
Uses vocabulary table first, Google Translate as fallback.
"""

from __future__ import annotations

import re

from .vocabulary import lookup, translate_with_vocab


CAR_NAME_MAPPINGS = {
    "ランドクルーザープラド": "Land Cruiser Prado",
    "ランドクルーザー": "Land Cruiser",
    "ハイラックス": "Hilux",
    "ハイエース": "HiAce",
    "アルファード": "Alphard",
    "ヴェルファイア": "Vellfire",
    "ヴォクシー": "Voxy",
    "ノア": "Noah",
    "ハリアー": "Harrier",
    "クラウン": "Crown",
    "エクストレイル": "X-Trail",
    "パジェロ": "Pajero",
    "プリウス": "Prius",
    "レクサス": "Lexus",
}


def translate_color(color_ja: str | None) -> str | None:
    """Translate color field using vocabulary table only."""
    if not color_ja:
        return None
    return translate_with_vocab(color_ja)


def translate_title(title_ja: str | None) -> str | None:
    """
    Translate car title to English.
    Keeps alphanumeric tokens as-is and translates known Japanese tokens.
    """
    if not title_ja:
        return None

    from .vocabulary import VOCAB

    title = title_ja.strip()
    # Replace model names first (longest match first)
    for ja_name, en_name in sorted(CAR_NAME_MAPPINGS.items(), key=lambda x: -len(x[0])):
        title = title.replace(ja_name, en_name)

    # Replace multi-word vocabulary entries (longest first, before splitting)
    for ja, en in sorted(VOCAB.items(), key=lambda x: -len(x[0])):
        if len(ja) >= 3 and ja in title:
            title = title.replace(ja, en)

    translated_tokens: list[str] = []
    for token in title.split():
        translated_tokens.extend(_translate_title_token(token))

    return " ".join(translated_tokens)


def translate_description(description_ja: str | None) -> str | None:
    """
    Translate seller description using Google Translate.
    Returns None if description is None, empty, or translation fails.
    """
    if not description_ja:
        return None

    try:
        from deep_translator import GoogleTranslator

        text = description_ja[:500]
        return GoogleTranslator(source="ja", target="en").translate(text)
    except Exception:
        return None


def translate_specs(specs: dict) -> dict:
    """Translate specs keys and values using vocabulary table."""
    from .vocabulary import VOCAB

    def _lookup(text: str) -> str:
        text = text.strip()
        if text in VOCAB:
            return VOCAB[text]
        # Partial match: check if any vocab key appears in text
        for ja, en in sorted(VOCAB.items(), key=lambda x: -len(x[0])):
            if ja in text and len(ja) >= 2:
                return text.replace(ja, en)
        return text

    result = {}
    for key, value in specs.items():
        en_key = _lookup(key)
        en_value = _lookup(str(value)) if value and str(value).strip() not in ("", "－", "−") else value
        result[en_key] = en_value
    return result


def translate_car(car: dict) -> dict:
    """
    Add *_en fields to a car dict. Never modifies *_ja fields.

    Adds:
        title_en, color_en, description_en, specs_en
    """
    return {
        **car,
        "title_en": translate_title(car.get("title_ja")),
        "color_en": translate_color(car.get("color_ja")),
        "description_en": translate_description(car.get("description_ja")),
        "specs_en": translate_specs(car.get("specs", {})),
    }


def _translate_title_token(token: str) -> list[str]:
    vocab_match = lookup(token)
    if vocab_match:
        return [vocab_match]

    translated = token
    for ja_text, en_text in sorted(CAR_NAME_MAPPINGS.items(), key=lambda item: len(item[0]), reverse=True):
        translated = translated.replace(ja_text, en_text)

    if translated != token:
        return _split_mapped_token(translated)

    return [token]


def _split_mapped_token(token: str) -> list[str]:
    return [part for part in re.split(r"\s+", token.strip()) if part]
