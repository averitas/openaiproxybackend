#!/usr/bin/env python
# -*- coding: utf-8 -*-

import datetime
import bcrypt
import json
import logging
import os
import zlib
from azure.data.tables import TableServiceClient, UpdateMode
from azure.core.exceptions import ResourceNotFoundError
from shared_lib.types.models import UserInfo
from shared_lib.handler import Message

TableName = 'openaiSessionTable'
# Table Schema
# {
#     "PartitionKey": "2021-08-01",
#     "RowKey": "1234567890",
#     "sessionId": "1234567890",
#     "context": [
#         {"role": "system", "content": "hello"},
#         {"role": "user", "content": "hello"},
#     ],
#     "date": "2021-08-01",
# }

UserTableName = 'openaiUserTable'
# Table Schema
# {
#     "PartitionKey": hash partition of email,
#     "RowKey": email,
#     "Email": email,
#     "Salt": generated salt,
#     "HashedPassword": hashed_password,
#     "CreatedAt": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
# }

connectionString = os.getenv('AzureDataStorage', '')

class PersistenceLayer:
    service: TableServiceClient

    def __init__(self) -> None:
        self.service = TableServiceClient.from_connection_string(conn_str=connectionString)

    def checkIfSessionExist(self, sessionId:str) -> dict | None:
        with self.service.get_table_client(table_name=TableName) as tableClient:
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
        
    def saveSession(self, message:Message) -> None:
        with self.service.get_table_client(table_name=TableName) as tableClient:
            data = {
                    "PartitionKey": message.pk,
                    "RowKey": message.sessionId,
                    "context": json.dumps(message.context),
                    "sessionId": message.sessionId,
                    "date": message.pk
                }
            
            tableClient.upsert_entity(data)

    def saveUser(self, user: UserInfo, isCreate: bool = True) -> None:
        with self.service.get_table_client(table_name=UserTableName) as tableClient:
            entity = user.toTableEntity()

            # Save the user to the database with the generated keys
            # Replace the following line with your database save logic
            logging.info(f"Saving user with PartitionKey: {entity.get('PartitionKey')} and RowKey: {entity.get('RowKey')}")

            if isCreate:
                tableClient.create_entity(entity)
            else:
                tableClient.upsert_entity(entity, mode = UpdateMode.REPLACE)
                
    def retrieveUser(self, userId: str) -> UserInfo | None:
        try:
            with self.service.get_table_client(table_name=UserTableName) as tableClient:
                entity = tableClient.get_entity(partition_key=UserInfo.generatePartitionKey(userId), row_key=userId)
                retval = UserInfo()
                retval.fromJson(entity)
                return retval
        except ResourceNotFoundError as err:
            logging.warning(f'User {userId} not found')
            return None
        except err:
            logging.error('Retrieve user err: ' + err)
            raise
    
    def checkUserPassword(self, inputUser: UserInfo) -> bool:
        with self.service.get_table_client(table_name=UserTableName) as tableClient:
            inputUserEntity = inputUser.toTableEntity()

            # Get existing user information
            existingUser = tableClient.get_entity(partition_key=inputUserEntity.get('PartitionKey', ''), row_key=inputUserEntity.get('RowKey', ''))
            if existingUser is None:
                return False
            
            # Hash the password with the salt
            input_hashed_password = bcrypt.hashpw(inputUser.Password.encode(), existingUser.get('Salt', ''))

            return input_hashed_password == existingUser.get('HashedPassword', '').encode()

def loadContextAsList(rawContext) -> list:
    if rawContext is None or len(rawContext) == 0:
        return []
    context = json.loads(rawContext)
    if type(context) is not list:
        context = [{"role": "system", "content": str(context)}]
    return context
