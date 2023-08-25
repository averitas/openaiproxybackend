import base64
from functools import wraps
import json
import logging
import os
from shared_lib.handler import CreateCORSResponseHeaders, Response
from shared_lib.types.models import UserInfo
from shared_lib.db import PersistenceLayer
from shared_lib.cache.redis import QuoteState

from shared_lib.cache import RedisClientInst
import azure.functions as azfunc
from azure.data.tables import TableServiceClient

db = PersistenceLayer()


def RedisThrottle(func):
    @wraps(func)
    def main(*args, **kwargs):
        logging.info('Throttle middleware before function execution')
        logging.info('args: ' + str(args) + 'kwargs: ' + str(kwargs))
        req = None
        # find func.Request
        for arg in args:
            if isinstance(arg, azfunc.HttpRequest):
                req = arg
                break
        if not req:
            # iterate kwargs key and value
            for _, value in kwargs.items():
                if isinstance(value, azfunc.HttpRequest):
                    req = value
                    break
        if not req:
            raise ValueError("Couldn't find func.HttpRequest in args or kwargs")

        # find user email
        upn = getUserNameFromRequest(req)
        logging.info(f"Message from User email: {upn}")
        passed = checkQuote(upn)
        if not passed:
            errResp = Response()
            errResp.code = -1
            errResp.message = f"API quote for user {upn} is exceeded, please contact admin lewis0204@outlook.com or wait 24 hours."
            errResp.data = None
            
            return azfunc.HttpResponse(
                body=errResp.toJson(),
                status_code=200,
                headers=CreateCORSResponseHeaders(),
            )

        try:
            result = func(*args, **kwargs)
        except Exception as ex:
            logging.error(f"Exception occurred in function {func.__name__}: {ex}")
            raise ex
        logging.info("Throttle middleware after function execution")
        return result
    return main

# User principle in header X-MS-CLIENT-PRINCIPAL format like:
# {
#     "auth_typ": "",
#     "claims": [
#         {
#             "typ": "",
#             "val": ""
#         }
#     ],
#     "name_typ": "",
#     "role_typ": ""
# }
# get typ is 'preferred_username' in 'claims'
def getUserNameFromRequest(req: azfunc.HttpRequest) -> str:
    token = req.headers['Authorization'].split(' ')[-1]
    logging.info('Receive auth token: ' + token)
    userPrincipleBytes = base64.b64decode(req.headers.get("X-MS-CLIENT-PRINCIPAL"))
    userClaims = json.loads(userPrincipleBytes.decode('utf8'), strict=False)
    
    # find preferred_username in claims
    for claimsItem in userClaims['claims']:
        if claimsItem['typ'] == 'preferred_username':
            return claimsItem['val']
    logging.warning("No user email found in token: " + userClaims)
    raise ValueError("Couldn't find user email in token")


def checkQuote(userId: str) -> bool:
    state = RedisClientInst.CheckUserQuote(userId=userId)
    if state == QuoteState.EXCEEDED:
        return False
    if state == QuoteState.NOTEXIST:
        userInfo = db.retrieveUser(userId=userId)
        if not userInfo:
            userInfo = UserInfo(email=userId)
            db.saveUser(user=userInfo)
        RedisClientInst.SetUserQuote(userInfo.Email, userInfo.QuoteInDay)
        return True
    if state == QuoteState.OK:
        return True
    return False
