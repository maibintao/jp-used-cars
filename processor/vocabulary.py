"""
Fixed Japanese -> English vocabulary for car listings.
Checked first before calling any translation API.
"""

VOCAB: dict[str, str] = {
    # Colors
    "白": "White",
    "黒": "Black",
    "シルバー": "Silver",
    "グレー": "Gray",
    "赤": "Red",
    "青": "Blue",
    "紺": "Navy",
    "緑": "Green",
    "ベージュ": "Beige",
    "ブラウン": "Brown",
    "ゴールド": "Gold",
    "オレンジ": "Orange",
    "黄": "Yellow",
    "真珠白": "Pearl White",
    "パールホワイト": "Pearl White",
    "ブラック": "Black",
    "ホワイト": "White",
    "パールブラック": "Pearl Black",
    # Fuel types
    "ガソリン": "Gasoline",
    "ディーゼル": "Diesel",
    "ディーゼルターボ": "Diesel Turbo",
    "ターボ": "Turbo",
    "ハイブリッド": "Hybrid",
    "電気": "Electric",
    "LPG": "LPG",
    # Drive types
    "4WD": "4WD",
    "2WD": "2WD",
    "FF": "Front-Wheel Drive",
    "FR": "Rear-Wheel Drive",
    "AWD": "AWD",
    # Transmission
    "AT": "Automatic",
    "MT": "Manual",
    "CVT": "CVT",
    "オートマ": "Automatic",
    "マニュアル": "Manual",
    # Body types
    "SUV": "SUV",
    "セダン": "Sedan",
    "ミニバン": "Minivan",
    "ハッチバック": "Hatchback",
    "ワゴン": "Wagon",
    "クーペ": "Coupe",
    "トラック": "Truck",
    "バン": "Van",
    "軽自動車": "Kei Car",
    # Condition notes
    "修復歴なし": "No accident history",
    "修復歴あり": "Has accident history",
    "禁煙車": "Non-smoking",
    "禁煙": "Non-smoking",
    "ワンオーナー": "One owner",
    "記録簿あり": "Service records available",
    "車検整備付": "Inspection included",
    "左ハンドル": "Left-hand drive",
    "右ハンドル": "Right-hand drive",
    # Common features
    "ナビ": "Navigation",
    "バックカメラ": "Rear camera",
    "ETC": "ETC",
    "サンルーフ": "Sunroof",
    "レザーシート": "Leather seats",
    "クルーズコントロール": "Cruise control",
    "衝突軽減装置": "Collision mitigation",
    "LEDヘッドライト": "LED headlights",
    "アルミホイール": "Alloy wheels",
    "スマートキー": "Smart key",
    "Bluetooth": "Bluetooth",
    "パワーシート": "Power seats",
}


def lookup(text: str) -> str | None:
    """Return English translation if text matches a vocabulary entry, else None."""
    return VOCAB.get(text.strip()) if text else None


def translate_with_vocab(text: str) -> str:
    """
    Replace Japanese tokens in text using vocabulary table.
    Falls back to original text if no match found.
    Used for short fields like color and fuel type.
    """
    if not text:
        return text
    result = lookup(text)
    return result if result else text
