"""Tests for translation and price conversion."""

from processor import price_converter
from processor.price_converter import convert_price
from processor.translator import translate_color, translate_title
from processor.vocabulary import lookup, translate_with_vocab


class TestVocabulary:
    def test_lookup_color(self):
        assert lookup("白") == "White"

    def test_lookup_missing(self):
        assert lookup("存在しない") is None

    def test_translate_with_vocab_match(self):
        assert translate_with_vocab("黒") == "Black"

    def test_translate_with_vocab_no_match(self):
        assert translate_with_vocab("不明") == "不明"


class TestTranslator:
    def test_translate_color_white(self):
        assert translate_color("白") == "White"

    def test_translate_color_pearl(self):
        assert translate_color("真珠白") == "Pearl White"

    def test_translate_color_none(self):
        assert translate_color(None) is None

    def test_translate_title_prado(self):
        result = translate_title("ランドクルーザープラド 2.8 TX ディーゼルターボ 4WD")
        assert "Land Cruiser Prado" in result
        assert "2.8" in result
        assert "TX" in result

    def test_translate_title_none(self):
        assert translate_title(None) is None


class TestPriceConverter:
    def test_convert_basic(self, monkeypatch):
        monkeypatch.setattr(price_converter, "_cached_rate", 0.0067)
        result = convert_price(2989000, 2500)
        assert result["price_usd"] is not None
        assert result["price_usd"] % 100 == 0
        assert result["shipping_usd"] == 2500
        assert result["total_usd"] == result["price_usd"] + 2500
        assert 0.005 < result["exchange_rate"] < 0.015

    def test_convert_none_price(self, monkeypatch):
        monkeypatch.setattr(price_converter, "_cached_rate", 0.0067)
        result = convert_price(None, 2500)
        assert result["price_usd"] is None
        assert result["total_usd"] is None
        assert result["shipping_usd"] == 2500
