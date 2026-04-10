from app.core.security import hash_senha

fake_users_db = {
    "admin@operis.com": {
        "email": "admin@operis.com",
        "senha": hash_senha("123456"),
        "plano": "ouro"
    }
}
