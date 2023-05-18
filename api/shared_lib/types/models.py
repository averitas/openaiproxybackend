#!/usr/bin/env python
# -*- coding: utf-8 -*-

from datetime import datetime
import json
import logging
import zlib

import bcrypt

# Table Schema
# {
#     "PartitionKey": hash partition of email,
#     "RowKey": email,
#     "Email": email,
#     "Salt": generated salt,
#     "HashedPassword": hashed_password,
#     "CreatedAt": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
# }

class UserInfo:
    def __init__(self, email: str, password: str) -> None:
        self.Email = email
        self.Password = password

    def toJson(self) -> str:
        return json.dumps(self, default=lambda o: o.__dict__, 
            sort_keys=True, indent=2)

    def fromJson(self, jsonDict: dict) -> None:
        for key in jsonDict:
            if key not in self.__dict__ and not key.startswith("_"):
                self.__dict__[key] = jsonDict[key]

    def toTableEntity(self) -> dict:
        # Hash the email to generate the PartitionKey
        partition_key = str(zlib.crc32(self.Email.encode()) % 100)

        # Set the RowKey to the email
        row_key = self.Email

        # Generate a random salt
        salt = bcrypt.gensalt()

        # Hash the password with the salt
        hashed_password = bcrypt.hashpw(self.Password.encode(), salt)

        entity = {
            "PartitionKey": partition_key,
            "RowKey": row_key,
            "Salt": salt,
            "HashedPassword": hashed_password,
            "CreatedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        for key in self.__dict__:
            if key not in entity and key != "Password" and not key.startswith("_"):
                entity[key] = self.__dict__[key]
        return entity
