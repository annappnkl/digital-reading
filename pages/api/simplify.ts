import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { word, sentence } = req.body;

  const prompt = `Simplify the word "${word}" in the sentence: \"${sentence}\". 
Return only a simpler synonym that fits in place. If it is already simple or inappropriate to replace, return "${word}".`;

  try {
    const result = await getChatCompletion(prompt);
    res.status(200).json({ replacement: result });
  } catch (err: unknown) {
    console.error('Simplify API error:', err);
    res.status(500).json({ error: 'Simplification failed' });
  }
}

// Helper
async function getChatCompletion(prompt: string, temperature: number = 0.3): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature,
      });
      return completion.choices[0].message.content?.trim() || '';
    } catch (err) {
      console.warn('GPT-4 failed, falling back to GPT-3.5:', err);
      const fallback = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature,
      });
      return fallback.choices[0].message.content?.trim() || '';
    }
  }