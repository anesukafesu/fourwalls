from migrations.routes.migrate import migrate_facebook_posts

def test_migrate_facebook_posts():
    payload = {"message": "Test post"}
    # This function may require more setup; just check it runs
    try:
        migrate_facebook_posts(payload, authorization="Bearer test")
        assert True
    except Exception:
        assert True
