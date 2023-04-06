# openaiproxybackend

## Local debug
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
