import os
import redis
from redis.commands.json.path import Path
from datetime import datetime, timedelta

from shared_lib.types.models import BaseEnum

redisHost = os.getenv('AZURE_REDIS_HOST', '')
redisSecret = os.getenv('AZURE_REDIS_SECRET', '')

SetUserQuoteScript = '''local userid = ARGV[1]
local userQuoteKey = string.format("users.quote.%s", userid)
local leftQuoteVal = redis.call("GET", userQuoteKey)
if not leftQuoteVal or leftQuoteVal == "" then
    return "NOTEXIST"
end
local leftQuote = tonumber(leftQuoteVal) - 1
if leftQuote < 0 then
    return "EXCEEDED"
end

redis.call("DECR", userQuoteKey)
return "OK"
'''

# Enum string of flags
QUOTE_EXCEED = 'EXCEEDED'
QUOTE_OK = 'OK'
QUOTE_NOT_EXIST = 'NOTEXIST'

class QuoteState(BaseEnum):
    EXCEEDED = 'EXCEEDED'
    OK = 'OK'
    NOTEXIST = 'NOTEXIST'


class CacheManager:
    def __init__(self) -> None:
        self.client = redis.Redis(host=redisHost, port=6380, password=redisSecret, decode_responses=True, ssl=True)
        return
    
    def _getUserQuoteKey(self, userId: str):
        return f'users.quote.{userId}'
    
    def CheckUserQuote(self, userId: str) -> QuoteState:
        res = self.client.eval(SetUserQuoteScript, 0, userId)
        if type(res) is not str or res not in QuoteState:
            raise ValueError("Redis SetUserQuote return invalid value: " + res)
        
        return QuoteState[res]
    
    # Set user left quote. Let expire time to 1 day.
    def SetUserQuote(self, userId: str, quote: int):
        return self.client.set(
            name=self._getUserQuoteKey(userId=userId),
            value=quote,
            ex=timedelta(days=1),
            )
