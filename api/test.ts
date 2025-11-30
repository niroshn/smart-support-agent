import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    return res.status(200).json({
      status: 'ok',
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      method: req.method
    });
  } catch (error) {
    return res.status(500).json({
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
