// pages/api/translate.ts

import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getChatCompletion(prompt: string, temperature = 0.3): Promise<string> {
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { word, target_language } = req.body;

  if (!word || !target_language) {
    return res.status(400).json({ error: 'Missing word or target language' });
  }

  const prompt = `Translate the English word "${word}" into ${target_language}. 
Use a clear, simple, and common translation. Only return the translated word.`;

  try {
    const translated = await getChatCompletion(prompt);
    res.status(200).json({ translated });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Translation failed:', error.message);
    } else {
      console.error('Translation failed:', error);
    }
    res.status(500).json({ error: 'Translation failed' });
  }
  
}
