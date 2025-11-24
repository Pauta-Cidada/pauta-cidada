"""Twitter/X integration service for posting news"""

import tweepy
import logging
from app.core.config import config
from app.db.models.news import News

logger = logging.getLogger(__name__)


class TwitterService:
    """Service for posting news to Twitter/X"""
    
    def __init__(self):
        """Initialize Twitter API client"""
        if not all([
            config.twitter_api_key,
            config.twitter_api_secret,
            config.twitter_access_token,
            config.twitter_access_token_secret
        ]):
            logger.warning("Twitter credentials not configured")
            self.client = None
            return
        
        try:
            self.client = tweepy.Client(
                consumer_key=config.twitter_api_key,
                consumer_secret=config.twitter_api_secret,
                access_token=config.twitter_access_token,
                access_token_secret=config.twitter_access_token_secret
            )
        except Exception as e:
            logger.error(f"Failed to initialize Twitter client: {e}")
            self.client = None
    
    def post_news_to_twitter(self, news: News) -> str:
        """
        Post news to Twitter/X
        
        Args:
            news: News object to post
            
        Returns:
            URL of the posted tweet
            
        Raises:
            Exception: If posting fails
        """
        if not self.client:
            raise Exception("Twitter client not initialized")
        
        # Build tweet text
        tweet_text = self._build_tweet_text(news)
        logger.info(f"Attempting to post tweet with {len(tweet_text)} characters")
        
        try:
            # Post tweet
            response = self.client.create_tweet(text=tweet_text)
            tweet_id = response.data['id']
            
            # Get username for URL construction
            me = self.client.get_me()
            username = me.data.username
            
            tweet_url = f"https://x.com/{username}/status/{tweet_id}"
            logger.info(f"Successfully posted news {news.id} to Twitter: {tweet_url}")
            
            return tweet_url
            
        except tweepy.errors.Forbidden as e:
            logger.error(f"Twitter API 403 Forbidden - Check app permissions (Read and Write required): {e}")
            raise Exception(f"Twitter posting failed: Insufficient permissions. Ensure your Twitter app has 'Read and Write' access.")
        except Exception as e:
            logger.error(f"Failed to post to Twitter: {e}")
            raise Exception(f"Twitter posting failed: {str(e)}")
    
    def _build_tweet_text(self, news: News) -> str:
        """
        Build tweet text from news data
        
        Args:
            news: News object
            
        Returns:
            Formatted tweet text (max 300 chars)
        """
        news_url = f"https://pautacidada.com.br/noticia/{news.id}"
        
        tweet = f"🗳️ {news.title}\n\n{news.summary}\n\nParticipe da discussão e vote!\n\n👉 {news_url}\n\n#PautaCidadã #Política"
        
        if len(tweet) > 300:
            tweet = tweet[:297] + "..."
        
        return tweet
