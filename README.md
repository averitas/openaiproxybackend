# openaiproxybackend

## Introduce
This project will save session and chat history as a proxy to openai model. When chat become long enough, it will compact chat history.

More features are still under development.

## Structure
Ignore the package.json under root directory.
-
|- api  The Azure function app that restore chat session and call openai completion API.
|- openaiproxywebsite  The frontend app based on React.js and Next.js
   |- pages  All webpages
      |- api  The API used by React app to call Azure function app in ./api folder.
   |- components  React frontend components

## Local debug api
under `api` folder.
Create a `local.settings.json`
```
{
  "IsEncrypted": false,
  "Values": {
    "AzureDataStorage": "Your storage connection string",
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "OPENAI_API_KEY": "your api key",
    "CHATGPT_MODEL": "your gpt model",
    "OPENAI_API_BASE": "your gpt endpoint url",
    "OPENAI_API_TYPE": "azure or open_ai",
    "OPENAI_API_VERSION": "2023-03-15-preview or delete this parameter",
    "AzureWebJobsStorage": "Your webjob storage connection string"
  }
}
```

Install Azure function core tool in this [url](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=v4%2Cwindows%2Ccsharp%2Cportal%2Cbash)

then run `func start` under api folder

## local debug website
under `openaiproxywebsite` folder.
See openaiproxywebsite/README.md

## endpoints
api trigger endpoint:
```
POST https://openaiproxybackendapp.azurewebsites.net/api/azopenaitrigger
{
    "promo": "Show me the folder structure of this azure function project.",
    "sessionId": "67214e13-ee31-4c05-b3bf-413f7815fa0d",
    "context": [""], // optional, if you need to add additional context
}
```
website endpoint:
```
openaiproxywebsite.azurewebsites.net
```

## TODO
- Session persistent in server and user browser.
- User system.
- Login with Wechat.
- Create application with preset context.
- Create knowledge base application with context and vector based search database.
