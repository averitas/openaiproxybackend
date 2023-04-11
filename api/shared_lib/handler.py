import datetime
import json
import uuid
import os
import openai
import logging

class Message:
    pk:str = None
    sessionId:str = None
    context:list[str] = None
    promo:str = None
    
    def __init__(self, pk:str=None, sessionId:str=None, context:list[str]=[], promo:str="") -> None:
        if pk is None or len(pk) == 0:
            self.pk = datetime.date.today().strftime("%Y%m%d")
        else:
            self.pk = pk
        if sessionId is None or len(sessionId) == 0:
            self.sessionId = str(uuid.uuid4())
        else:
            self.sessionId = sessionId
        if context is None or type(context) is not list:
            self.context = []
        else:
            self.context = context
        if promo is None:
            promo = ""
        self.promo = promo
        
    def toJson(self) -> str:
        return json.dumps(self, default=lambda o: o.__dict__, 
            sort_keys=True, indent=2)
        
    def fromJson(self, jsonDict: dict) -> None:
        self.sessionId = jsonDict.get('pk')
        self.sessionId = jsonDict.get('sessionId')
        self.context = jsonDict.get('context')
        self.promo = jsonDict.get('promo')
        
    def pushContext(self, role:str='system', content:str='') -> None:
        if content is None or len(content) == 0:
            return
        self.context.append({"role": role, "content": content})
        
class Response:
    code: int = 0
    message: str = ""
    data = None
    
    def toJson(self) -> str:
        return json.dumps(self, default=lambda o: o.__dict__, 
            sort_keys=True, indent=2)
    

class OpenaiHandler:
    def __init__(self, message: Message) -> None:
        # Setting up the deployment name
        self.chatgpt_model_name = os.getenv("CHATGPT_MODEL")
        # This is set to `azure`
        # openai.api_type = "azure"
        openai.api_type = os.getenv("OPENAI_API_TYPE")
        # The API key for your Azure OpenAI resource.
        openai.api_key = os.getenv("OPENAI_API_KEY")
        # The base URL for your Azure OpenAI resource. e.g. "https://<your resource name>.openai.azure.com"
        openai.api_base = os.getenv('OPENAI_API_BASE')
        # Currently Chat Completion API have the following versions available: 2023-03-15-preview
        openai.api_version = os.getenv('OPENAI_API_VERSION')
        
        self.message = message
        pass
    
    def runChatCompletion(self) -> Response:
        retval = Response()
        retval.data = self.message
        try:
            response = self.completion()
            self.compactMsgContextWithSummaryIfNeed()
        except Exception as ex:
            retval.message = str(ex)
            retval.code = -1
        else:
            retval.code = 0
            retval.message = response
        return retval
    
    def compactMsgContextWithSummaryIfNeed(self):
        totalTokenLen = sum([len(token.get('content')) for token in self.message.context])
        logging.info(f"Token length of Chat of session {self.message.sessionId} is {totalTokenLen}")
        
        if len(self.message.context) > 10 or totalTokenLen > 10000:
            logging.info(f"Chat of session {self.message.sessionId} is too long, compacting")
            self.compactMsgContextWithSummary()
    
    def compactMsgContextWithSummary(self):
        self.message.promo = "Summary this chat."
        response = self.completion()
        self.message.context = []
        self.message.pushContext(content=response)
    
    def completion(self) -> str:
        self.message.pushContext(role='user', content=self.message.promo)
        
        try:
            response = openai.ChatCompletion.create(
                  engine=self.chatgpt_model_name,
                  messages=self.message.context
                )
            self.response = response['choices'][0]['message']['content']
            self.message.pushContext(content=self.response)
            logging.info(self.response)
            return self.response
        except openai.error.APIError as e:
            # Handle API error here, e.g. retry or log
            logging.error(f"OpenAI API returned an API Error: {e}")
            raise e
        except openai.error.AuthenticationError as e:
            # Handle Authentication error here, e.g. invalid API key
            logging.error(f"OpenAI API returned an Authentication Error: {e}")
            raise e
        except openai.error.APIConnectionError as e:
            # Handle connection error here
            logging.error(f"Failed to connect to OpenAI API: {e}")
            raise e
        except openai.error.InvalidRequestError as e:
            # Handle connection error here
            logging.error(f"Invalid Request Error: {e}")
            raise e
        except openai.error.RateLimitError as e:
            # Handle rate limit error
            logging.error(f"OpenAI API request exceeded rate limit: {e}")
            raise e
        except openai.error.ServiceUnavailableError as e:
            # Handle Service Unavailable error
            logging.error(f"Service Unavailable: {e}")
            raise e
        except openai.error.Timeout as e:
            # Handle request timeout
            logging.error(f"Request timed out: {e}")
            raise e
        except:
            # Handles all other exceptions
            logging.error("An exception has occured.")
            raise e
    
    def onlyCompletion(self) -> str:
        response = openai.Completion.create(
              engine=self.chatgpt_model_name,
              model=self.chatgpt_model_name,
              prompt=[f'"{item["role"]}" said: "{item["content"]}\n\r"' for item in self.message.context],
              temperature=0.5,
              max_tokens=512, # Number of tokens to generate
              n=1, # Number of completions to generate
              stop=None, # Sequence where the API will stop generating further tokens
              frequency_penalty=0, # Higher penalty means less repetition of the same response
              presence_penalty=0, # Higher penalty means less repetition of the same response
                )
            # print the response
        self.response = response['choices'][0]['text']
        return self.response
    