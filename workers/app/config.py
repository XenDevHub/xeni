"""XENI AI Workers — Configuration."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # RabbitMQ
    RABBITMQ_URI: str = "amqp://xeni:xeni_secret@rabbitmq:5672/xeni_vhost"

    # MongoDB
    MONGO_URI: str = "mongodb://xeni:xeni_secret@mongodb:27017/xeni_outputs?authSource=admin"

    # LLM API Keys
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    # Facebook / Meta
    META_GRAPH_API_VERSION: str = "v19.0"
    FACEBOOK_APP_SECRET: str = ""

    # Courier APIs
    PATHAO_API_BASE_URL: str = "https://hermes-api.pathao.com"
    STEADFAST_API_BASE_URL: str = "https://portal.steadfast.com.bd/api/v1"

    # MFS Verification
    BKASH_VERIFICATION_URL: str = ""
    NAGAD_VERIFICATION_URL: str = ""

    # Resend Email
    RESEND_API_KEY: str = ""

    # FCM
    FCM_SERVER_KEY: str = ""

    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = "xeni-outputs"
    AWS_S3_REGION: str = "ap-southeast-1"

    # Worker-specific (overridden per container)
    TASK_QUEUE: str = "conversation_tasks"
    RESULT_QUEUE: str = "task_results"
    DLQ_NAME: str = "conversation_tasks_dlq"
    MAX_RETRIES: int = 3
    PORT: int = 8001
    AGENT_TYPE: str = "conversation"

    class Config:
        env_file = ".env"


settings = Settings()
