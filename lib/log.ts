import { supabase } from './supabaseClient';

interface LogParams {
  session_id?: string;
  user_id?: string;
  condition: string;
  word: string;
  word_index_original: number;
  word_index_displayed: number;
  action: 'click_only' | 'synonym' | 'explanation' | 'undo' | 'retry' | 'explain_after_replace';
  original_sentence: string;
  label: string;
  result_summary: string;
  replacement?: string | null;
  explanation?: string | null;
  generated_text?: string | null;
}

export async function logWordClick(params: LogParams) {
  const {
    session_id = localStorage.getItem('session_id') || 'unknown',
    user_id = localStorage.getItem('user_id') || 'unknown',
    ...rest
  } = params;

  const timestamp = new Date().toISOString();

  const { error } = await supabase.from('word_clicks').insert({
    session_id: session_id,
    user_id: user_id,
    timestamp,
    ...rest
  });

  if (error) {
    console.error('Error logging word click:', error);
  }
}
