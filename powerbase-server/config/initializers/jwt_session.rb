JWTSessions.encryption_key = ENV["jwt_encryption_key"]
JWTSessions.token_store = :redis, { redis_url: ENV["redis_url"] }
