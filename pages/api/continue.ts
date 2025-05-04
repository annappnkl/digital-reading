// pages/api/continue.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { context, word, extend } = req.body;

  const prompt = extend
    ? `Continue this story logically and smoothly based on what came before:
"""
${context}
"""
Add 1–2 new sentences that match the story’s tone and characters. Include the word "${word}" in a natural, meaningful way.`
    : `Insert a follow-up sentence to this story that feels natural and maintains flow:
"""
${context}
"""
Add a single sentence that smoothly reuses the word "${word}". Keep tone, pacing, and characters consistent.`;

  try {
    const result = await getCompletion(prompt);
    const addition = result.choices[0].message.content?.trim();
    res.status(200).json({ addition });
  } catch (error) {
    console.error('Continue API error:', error);
    res.status(500).json({ error: 'Unable to continue story' });
  }
}

async function getCompletion(prompt: string) {
  try {
    return await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });
  } catch (err) {
    console.warn('Falling back to GPT-3.5 for continuation.');
    return await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });
  }
}