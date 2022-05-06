JWTSessions.encryption_key = ENV["JWT_ENCRYPTION_KEY"]
JWTSessions.token_store = :redis, { redis_url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/1') }
