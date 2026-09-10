import pytest
from datetime import timedelta
from app.utils.security import get_password_hash, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    raw = "SecretPass123"
    hashed = get_password_hash(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPass", hashed) is False

def test_jwt_token_generation_and_decoding():
    payload = {"sub": "user@example.com", "role": "student", "user_id": 10}
    token = create_access_token(payload, expires_delta=timedelta(minutes=30))
    decoded = decode_access_token(token)
    assert decoded["sub"] == "user@example.com"
    assert decoded["role"] == "student"
    assert decoded["user_id"] == 10

def test_invalid_jwt_token():
    with pytest.raises(ValueError):
        decode_access_token("invalid.token.structure")
