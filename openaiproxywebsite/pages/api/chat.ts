// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  data: string
  sessionId: string
}

const FunctionKey = process.env.AZ_OPENAI_TRIGGER_FUNCTION_KEY ?? ""
const FunctionEndpoint = process.env.AZ_OPENAI_TRIGGER_FUNCTION_ENDPOINT ?? ""

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    console.log('receive request: ' + JSON.stringify(req.body))
    const message = req.body.message
    const session = req.body.session

    // make a POST request to the backend server
    const response = await fetch(FunctionEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': FunctionKey
      },
      body: JSON.stringify({
        promo: message,
        sessionId: session
      })
    });

    const data = await response.json();

    res.status(200).json({ data: data.message, sessionId: data.data.sessionId });
    return
  }

  res.status(200).json({ data: 'Error', sessionId: '' })
}
