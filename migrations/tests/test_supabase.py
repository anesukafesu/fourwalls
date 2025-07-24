from migrations.utils.supabase import parse_price, infer_status

# Test parse_price

def test_parse_price():
    assert parse_price("$1000") is not None
    assert parse_price("1000 USD") is not None
    assert parse_price("") is None or parse_price("") == 0

# Test infer_status

def test_infer_status():
    assert infer_status(1000, "available") is not None
    assert infer_status(None, None) is not None
