// lib/generateQuestions.ts
export async function generateQuestions(session_id: string, condition: string) {
  const res = await fetch('/api/generate-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, condition })
  });

  return res.json(); // { questions: [...] }
}
