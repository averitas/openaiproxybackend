#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import logging
import os
from shared_lib.db import PersistenceLayer, loadContextAsList
from shared_lib.handler import Message, OpenaiHandler
from azure.data.tables import TableServiceClient

import azure.functions as func

app = func.FunctionApp()

connectionString = os.getenv('AzureDataStorage', '')
service = TableServiceClient.from_connection_string(conn_str=connectionString)

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    db = PersistenceLayer()
    name = req.params.get('version')
    if name:
        chatgpt_model_name = os.getenv("CHATGPT_MODEL")
        api_version = os.getenv('OPENAI_API_VERSION')
        return func.HttpResponse(f"Hello, {name}. Model: {chatgpt_model_name}, apiversion: {api_version}.")
    
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
