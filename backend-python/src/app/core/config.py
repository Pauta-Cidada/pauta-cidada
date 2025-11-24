from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from pydantic import Field

load_dotenv()

class Config(BaseSettings):
    app_name: str = "ScalableFastAPIProject"
    debug: bool = False
    db_user: str = ""
    db_password: str = ""
    db_name: str = "test.db"
    
    # Twitter/X Configuration
    twitter_api_key: str = Field(default="")
    twitter_api_secret: str = Field(default="")
    twitter_access_token: str = Field(default="")
    twitter_access_token_secret: str = Field(default="")
    twitter_bearer_token: str = Field(default="")
    twitter_vote_threshold: int = Field(default=10)

    @property
    def db_url(self):
        return f"sqlite:///./{self.db_name}"

config = Config()