"""
Translates Japanese car listing fields to English.
Uses vocabulary table first, Google Translate as fallback for remaining Japanese.
"""

from __future__ import annotations

import re
import time

from .vocabulary import lookup, translate_with_vocab

CJK_RE = re.compile(r"[぀-ヿ一-鿿]")

_gt_cache: dict[str, str] = {}


def _google_translate(text: str) -> str:
    """Translate a single string via Google Translate with caching."""
    text = text.strip()
    if not text or not CJK_RE.search(text):
        return text
    if text in _gt_cache:
        return _gt_cache[text]
    try:
        from deep_translator import GoogleTranslator
        result = GoogleTranslator(source="ja", target="en").translate(text[:300])
        time.sleep(0.1)
        _gt_cache[text] = result or text
        return _gt_cache[text]
    except Exception:
        return text


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
    if not color_ja:
        return None
    result = translate_with_vocab(color_ja)
    if CJK_RE.search(result):
        result = _google_translate(result)
    return result


def translate_title(title_ja: str | None) -> str | None:
    if not title_ja:
        return None

    from .vocabulary import VOCAB

    title = title_ja.strip()
    for ja_name, en_name in sorted(CAR_NAME_MAPPINGS.items(), key=lambda x: -len(x[0])):
        title = title.replace(ja_name, en_name)

    for ja, en in sorted(VOCAB.items(), key=lambda x: -len(x[0])):
        if len(ja) >= 3 and ja in title:
            title = title.replace(ja, en)

    # Translate any remaining Japanese tokens via Google Translate
    tokens: list[str] = []
    for token in title.split():
        if CJK_RE.search(token):
            tokens.append(_google_translate(token))
        else:
            tokens.extend(_translate_title_token(token))

    return " ".join(tokens)


def translate_description(description_ja: str | None) -> str | None:
    if not description_ja:
        return None
    try:
        from deep_translator import GoogleTranslator
        text = description_ja[:500]
        return GoogleTranslator(source="ja", target="en").translate(text)
    except Exception:
        return None


def translate_specs(specs: dict) -> dict:
    """Translate specs keys and values: vocab first, Google Translate as fallback."""
    from .vocabulary import VOCAB

    def _vocab_lookup(text: str) -> str:
        text = text.strip()
        if text in VOCAB:
            return VOCAB[text]
        for ja, en in sorted(VOCAB.items(), key=lambda x: -len(x[0])):
            if ja in text and len(ja) >= 2:
                return text.replace(ja, en)
        return text

    SKIP_VALUE_TRANSLATE = re.compile(
        r"プラン|支払|諸費用|車両本体|残価|対象車両|納車前|部品交換|サービス"
    )

    result = {}
    for key, value in specs.items():
        en_key = _vocab_lookup(key)
        # Fall back to Google Translate for keys still in Japanese
        if CJK_RE.search(en_key):
            en_key = _google_translate(en_key)

        val_str = str(value).strip() if value else ""
        if not val_str or val_str in ("－", "−", "—", ""):
            en_value = value
        elif SKIP_VALUE_TRANSLATE.search(key):
            en_value = value  # skip long admin/price text
        else:
            en_value = _vocab_lookup(val_str)
            if CJK_RE.search(str(en_value)) and len(val_str) < 80:
                en_value = _google_translate(val_str)

        result[en_key] = en_value
    return result


def translate_car(car: dict) -> dict:
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
    for ja_text, en_text in sorted(CAR_NAME_MAPPINGS.items(), key=lambda x: -len(x[0])):
        translated = translated.replace(ja_text, en_text)
    if translated != token:
        return [p for p in re.split(r"\s+", translated.strip()) if p]
    return [token]
