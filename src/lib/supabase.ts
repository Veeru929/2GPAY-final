import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Transaction = {
  id: string;
  upi_id: string;
  amount: number;
  note: string;
  status: 'success' | 'failed' | 'pending';
  mode: 'auto' | 'manual';
  created_at: string;
  user_id: string;
};

export type AppSetting = {
  key: string;
  value: string;
};

export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return data as Transaction[];
}

export async function addTransaction(tx: Omit<Transaction, 'id' | 'created_at' | 'user_id'>): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert(tx)
    .select()
    .single();
  if (error) throw error;
  return data as Transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

export async function updateTransactionStatus(id: string, status: Transaction['status']): Promise<void> {
  const { error } = await supabase.from('transactions').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) throw error;
  return data?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const { data: existing } = await supabase
    .from('app_settings')
    .select('id')
    .eq('key', key)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('app_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('app_settings')
      .insert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
  }
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('app_settings').select('key, value');
  if (error) throw error;
  const map: Record<string, string> = {};
  (data as AppSetting[] | null)?.forEach((s) => { map[s.key] = s.value; });
  return map;
}
