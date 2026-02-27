from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5436/naguib"

    # Auth
    JWT_SECRET: str = "dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 168  # 7 days

    # AI
    ANTHROPIC_API_KEY: str = ""
    LLM_PROVIDER: str = "anthropic"
    LLM_MODEL: str = "claude-sonnet-4-20250514"

    # Frontend
    FRONTEND_URL: str = "http://localhost:3002"

    # AWS S3 (empty = local filesystem)
    AWS_S3_BUCKET: str = ""
    AWS_REGION: str = "us-east-1"

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRO_PRICE_ID: str = ""

    # Rate limiting
    FREE_MESSAGES_PER_DAY: int = 20
    PRO_MESSAGES_PER_DAY: int = 200
    FREE_PROJECT_LIMIT: int = 1

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
