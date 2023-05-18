#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging

import azure.functions as func
from api.shared_lib.types.errors import AuthError

from api.shared_lib.user import UserLogin


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('User login api triggered.')

    body = req.get_json()
    if not body:
        return func.HttpResponse(f"Empty body", status_code=400)

    try:
        token = UserLogin(body.get('Email'), body.get('Password'))
        logging.info(f"User: [{body.get('Email')}] login success. Token: {token}")
        return func.HttpResponse(token, status_code=200)
    except AuthError as ex:
        return func.HttpResponse(f"Auth failed: {ex}", status_code=401)
