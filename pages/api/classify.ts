import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { word, sentence } = req.body;

  const prompt = `In the sentence: \"${sentence}\", is the word \"${word}\" a person's name, a location, or neither? Reply with one word: person, location, or neither.`;

  try {
    const result = await getChatCompletion(prompt, 0);
    res.status(200).json({ label: result.toLowerCase().trim() });
  } catch (err) {
    console.error('Classify API error:', err);
    res.status(500).json({ error: 'Classification failed' });
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
  