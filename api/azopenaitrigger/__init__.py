#!/usr/bin/env python
# -*- coding: utf-8 -*-

import base64
import json
import logging
import os
from shared_lib.middlewares.throttle import RedisThrottle
from shared_lib.cache import RedisClientInst
from shared_lib.cache.redis import QuoteState
from shared_lib.types.models import UserInfo
from shared_lib.db import PersistenceLayer, loadContextAsList
from shared_lib.handler import CreateCORSResponseHeaders, Message, OpenaiHandler, Response
from azure.data.tables import TableServiceClient

import azure.functions as func

app = func.FunctionApp()

db = PersistenceLayer()

@RedisThrottle
def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    name = req.params.get('version')
    
    token = req.headers['Authorization'].lstrip("Bearer ")
    logging.info('Receive auth token: ' + token)
    logging.info(f'X-MS-CLIENT-PRINCIPAL-NAME is {req.headers.get("X-MS-CLIENT-PRINCIPAL-NAME", "N/A")}')
    logging.info(f'X-MS-CLIENT-PRINCIPAL is {req.headers.get("X-MS-CLIENT-PRINCIPAL", "N/A")}')
    
    if name:
        chatgpt_model_name = os.getenv("CHATGPT_MODEL")
        api_version = os.getenv('OPENAI_API_VERSION')
        return func.HttpResponse(f"Hello, {name}. Model: {chatgpt_model_name}, apiversion: {api_version}.", headers=CreateCORSResponseHeaders())
    
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
        return func.HttpResponse(f'Input is not valid', status_code=400, headers=CreateCORSResponseHeaders())
    
    message = Message(pk, sessionId, context, promo) # type: ignore
    handler = OpenaiHandler(message)
    
    try:
        response = handler.runChatCompletion()
        if response.code >= 0:
            db.saveSession(message)
        headers = CreateCORSResponseHeaders()
        headers['Content-Type'] = 'application/json'

        return func.HttpResponse(
            response.toJson(),
            status_code=200,
            headers=headers)
    except Exception as ex:
        return func.HttpResponse(
             f"Error: {ex}",
             status_code=500,
             headers=CreateCORSResponseHeaders(),
        )
