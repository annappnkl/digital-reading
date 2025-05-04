import { supabase } from './supabaseClient';

type LogWordClickParams = {
  userId: string;
  sessionId: string;
  page: number;
  word: string;
  wordIndex: number;
  action: 'synonym' | 'explanation' | 'retry' | 'undo';
  originalSentence: string;
  label?: string;
  resultSummary?: string;
  replacement?: string | null;
  explanation?: string | null;
  generatedText?: string | null;
};

export async function logWordClick(params: LogWordClickParams) {
  const { error } = await supabase.from('word_clicks').insert([
    {
      user_id: params.userId,
      session_id: params.sessionId,
      page: params.page,
      word: params.word,
      word_index: params.wordIndex,
      action: params.action,
      original_sentence: params.originalSentence,
      label: params.label || null,
      result_summary: params.resultSummary || null,
      replacement: params.replacement || null,
      explanation: params.explanation || null,
      generated_text: params.generatedText || null,
    },
  ]);

  if (error) {
    console.error('❌ Error logging word click:', error.message);
  } else {
    console.log('✅ Logged:', params.word, params.action);
  }
}
