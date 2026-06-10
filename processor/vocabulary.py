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
    # Specs table keys
    "排気量": "Engine Displacement",
    "燃料": "Fuel",
    "車体色": "Color",
    "定員": "Seating Capacity",
    "乗車定員": "Seating",
    "車体": "Body Type",
    "ミッション": "Transmission",
    "駆動方式": "Drive Type",
    "ドア数": "Doors",
    "修復歴": "Accident History",
    "保証": "Warranty",
    "車検": "Inspection",
    "走行距離": "Mileage",
    "年式": "Year",
    "最大積載量": "Max load",
    "車両重量": "Vehicle weight",
    "全長": "Length",
    "全幅": "Width",
    "全高": "Height",
    "ホイールベース": "Wheelbase",
    # Condition
    "記録簿": "Service records",
    "保証付": "Warranty included",
    # Interior / equipment
    "中期": "mid-spec",
    "前期": "early model",
    "後期": "late model",
    "純正": "OEM",
    "ナビTV": "nav/TV",
    "フルセグ": "full-seg TV",
    "全周囲カメラ": "360° camera",
    "パノラマモニター": "panoramic monitor",
    "ドラレコ": "dashcam",
    "ドライブレコーダー": "dashcam",
    "シートカバー": "seat covers",
    "センターデフロック": "centre diff lock",
    "リフトアップ": "lift-up",
    "ローダウン": "lowered",
    "ムーンルーフ": "moonroof",
    "フリップダウン": "flip-down monitor",
    "両側電動スライドドア": "dual power sliding doors",
    "電動スライドドア": "power sliding door",
    "パワーバックドア": "power tailgate",
    "シートヒーター": "heated seats",
    "メモリーシート": "memory seats",
    "ハンドルヒーター": "heated steering wheel",
    "ステアリングヒーター": "heated steering wheel",
    # Safety
    "レーダークルーズ": "radar cruise control",
    "衝突軽減": "collision mitigation",
    "車線逸脱": "lane departure warning",
    "ブラインドスポット": "blind spot monitor",
    "パーキングサポート": "parking assist",
    "自動ブレーキ": "auto brake",
    "プリクラッシュ": "pre-crash safety",
    # Wheels / exterior
    "LEDヘッド": "LED headlights",
    "LEDテール": "LED tail lights",
    "フォグランプ": "fog lights",
    "ルーフキャリア": "roof carrier",
    "ルーフラック": "roof rack",
    "リアラダー": "rear ladder",
    # Spec qualifiers
    "ロング": "long wheelbase",
    "ハイルーフ": "high roof",
    "標準ルーフ": "standard roof",
    "ワイド": "wide body",
    "スーパーロング": "super long",
    # Spec values
    "なし": "None",
    "あり": "Yes",
    "有": "Yes",
    "無": "None",
    "不明": "Unknown",
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
