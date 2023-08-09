#!/usr/bin/env python
# -*- coding: utf-8 -*-

import base64
import json
import logging
import os
from api.shared_lib.cache import RedisClientInst
from api.shared_lib.cache.redis import QuoteState
from api.shared_lib.types.models import UserInfo
from shared_lib.db import PersistenceLayer, loadContextAsList
from shared_lib.handler import Message, OpenaiHandler
from azure.data.tables import TableServiceClient

import azure.functions as func

app = func.FunctionApp()

connectionString = os.getenv('AzureDataStorage', '')
service = TableServiceClient.from_connection_string(conn_str=connectionString)
db = PersistenceLayer()

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    name = req.params.get('version')
    if name:
        chatgpt_model_name = os.getenv("CHATGPT_MODEL")
        api_version = os.getenv('OPENAI_API_VERSION')
        return func.HttpResponse(f"Hello, {name}. Model: {chatgpt_model_name}, apiversion: {api_version}.")
    
    upn = getUserNameFromRequest(req)
    passed = checkQuote(upn)
    if not passed:
        return func.HttpResponse(
            f"API quote for user {upn} is exceeded, please contact admin.",
            status_code=200
        )
    
    try:
        req_body = req.get_json()
        logging.info(f"reveived request body: {req_body}")
        pk = req_body.get('pk', '')
        sessionId = req_body.get('sessionId')
        context = loadContextAsList(req_body.get('context'))
        promo = req_body.get('promo')
        
        # check is session exist
        if sessionId is not None and len(sessionId) > 0:
            sessionData = db.checkIfSessionExist(sessionId=sessionId)
            # session exist, merge it with user input
            if sessionData is not None:
                for c in context:
                    sessionData.get('context', []).append(c)
                context = sessionData.get('context')
                pk = sessionData.get('pk')
                
    except ValueError:
        return func.HttpResponse(f'Input is not valid', status_code=400)
    
    message = Message(pk, sessionId, context, promo) # type: ignore
    handler = OpenaiHandler(message)
    
    try:
        response = handler.runChatCompletion()
        if response.code >= 0:
            db.saveSession(message)

        return func.HttpResponse(response.toJson(), status_code=200)
    except Exception as ex:
        return func.HttpResponse(
             f"Error: {ex}",
             status_code=500
        )

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
def getUserNameFromRequest(req: func.HttpRequest) -> str:
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
