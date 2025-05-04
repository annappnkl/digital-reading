import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const logSessionStart = async (userId: string) => {
  return await supabase.from('sessions').insert([{ user_id: userId, start_time: new Date().toISOString() }]);
};

export const logSessionEnd = async (userId: string) => {
  const { data: existing } = await supabase
    .from('sessions')
    .select('start_time')
    .eq('user_id', userId)
    .order('start_time', { ascending: false })
    .limit(1);

  const start = existing?.[0]?.start_time ? new Date(existing[0].start_time) : new Date();
  const end = new Date();
  const duration_secs = Math.round((end.getTime() - start.getTime()) / 1000);

  return await supabase.from('sessions').update({
    end_time: end.toISOString(),
    duration_secs
  }).eq('user_id', userId);
};
