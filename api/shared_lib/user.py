#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import logging
import uuid
from shared_lib.db import PersistenceLayer
from shared_lib.types.errors import AuthError

from shared_lib.types.models import UserInfo

# Return user token if auth success.
# Otherwise, raise AuthError.
def UserLogin(Email: str, Password: str) -> str:
    db = PersistenceLayer()
    user = UserInfo(Email, Password)

    isCorrect = db.checkUserPassword(user)
    if not isCorrect:
        raise AuthError("Email or password is incorrect.")

    # TODO: save usertoken
    return str(uuid.uuid4())

# Create user
def UserCreate(Email: str, Password: str) -> str:
    db = PersistenceLayer()
    user = UserInfo(Email, Password)

    db.saveUser(user)

    # TODO: save usertoken
    return str(uuid.uuid4())

# Validate usertoken
# TODO
def UserValidate(UserToken: str) -> UserInfo: # type: ignore
    pass
