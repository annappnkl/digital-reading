import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { supabase } from '../../lib/supabaseClient';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { session_id, condition } = req.body;

  const { data: clicks } = await supabase
    .from('word_clicks')
    .select('word, original_sentence')
    .eq('session_id', session_id)
    .eq('condition', condition)
    .order('timestamp', { ascending: true })
    .limit(3);

    if (!clicks || clicks.length === 0) {
        return res.status(200).json({ questions: [] });
      }
      
      const context = clicks.map(({ word, original_sentence }) =>
        `Word: "${word}"\nSentence: "${original_sentence}"`
      ).join('\n\n');
      

  const prompt = `
You are an English teacher. Given the context below, generate 3 reading comprehension questions that check if the reader understood the meaning of the bolded words in their sentence context. Include a short answer for each.

Context:
${context}

Output format:
1. Question: ...
   Answer: ...
2. Question: ...
   Answer: ...
3. Question: ...
   Answer: ...
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });

  const text = completion.choices[0].message.content;
  const qaPairs = text?.split(/\d+\.\sQuestion:/).slice(1).map(entry => {
    const [q, a] = entry.trim().split(/Answer:/);
    return {
      question: q.trim(),
      answer: a.trim()
    };
  });

  res.status(200).json({ questions: qaPairs });
}
