import json
import logging
import os
from shared_lib.handler import Message, OpenaiHandler
from azure.data.tables import TableServiceClient

import azure.functions as func

TableName = 'openaiSessionTable'

app = func.FunctionApp()

connectionString = os.getenv('AzureDataStorage')
service = TableServiceClient.from_connection_string(conn_str=connectionString)

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    name = req.params.get('version')
    if name:
        chatgpt_model_name = os.getenv("CHATGPT_MODEL")
        api_version = os.getenv('OPENAI_API_VERSION')
        return func.HttpResponse(f"Hello, {name}. Model: {chatgpt_model_name}, apiversion: {api_version}.")
    
    try:
        req_body = req.get_json()
        logging.info(f"reveived request body: {req_body}")
        pk = req_body.get('pk')
        sessionId = req_body.get('sessionId')
        context = loadContextAsList(req_body.get('context'))
        promo = req_body.get('promo')
        
        # check is session exist
        if sessionId is not None and len(sessionId) > 0:
            sessionData = checkIfSessionExist(sessionId=sessionId)
            # session exist, merge it with user input
            if sessionData is not None:
                for c in context:
                    sessionData.get('context').append(c)
                context = sessionData.get('context')
                pk = sessionData.get('pk')
                
    except ValueError:
        return func.HttpResponse(f'Input is not valid', status_code=400)
    
    message = Message(pk, sessionId, context, promo)
    handler = OpenaiHandler(message)
    
    try:
        response = handler.runChatCompletion()
        if response.code >= 0:
            saveSession(message)

        return func.HttpResponse(response.toJson(), status_code=200)
    except Exception as ex:
        return func.HttpResponse(
             f"Error: {ex}",
             status_code=500
        )

def checkIfSessionExist(sessionId:str) -> dict:
    tableClient = service.get_table_client(table_name=TableName)
    filterStr = f"RowKey eq '{sessionId}'"
    entities = tableClient.query_entities(query_filter=filterStr)
    if entities is None:
        return None
    for entity in entities:
        context = loadContextAsList(entity.get('context'))
        retval = {
            "context": context,
            "pk": entity.get('PartitionKey'),
            "sessionId": entity.get('RowKey')
        }
        
        return retval
    
def saveSession(message:Message) -> None:
    tableClient = service.get_table_client(table_name=TableName)
    data = {
            "PartitionKey": message.pk,
            "RowKey": message.sessionId,
            "context": json.dumps(message.context),
            "sessionId": message.sessionId,
            "date": message.pk
        }
    
    tableClient.upsert_entity(data)

def loadContextAsList(rawContext) -> list:
    if rawContext is None or len(rawContext) == 0:
        return []
    context = json.loads(rawContext)
    if type(context) is not list:
        context = [{"role": "system", "content": str(context)}]
    return context
