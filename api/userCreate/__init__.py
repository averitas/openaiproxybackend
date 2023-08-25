#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging

import azure.functions as func
from shared_lib.handler import CreateCORSResponseHeaders
from shared_lib.types.errors import AuthError

from shared_lib.user import UserCreate


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('User login api triggered.')

    body = req.get_json()
    if not body:
        return func.HttpResponse(f"Empty body", status_code=400, headers=CreateCORSResponseHeaders())

    try:
        token = UserCreate(body.get('Email'), body.get('Password'))
        logging.info(f"User: [{body.get('Email')}] login success. Token: {token}")
        return func.HttpResponse(token, status_code=200, headers=CreateCORSResponseHeaders())
    except AuthError as ex:
        return func.HttpResponse(f"Auth failed: {ex}", status_code=401, headers=CreateCORSResponseHeaders())
