import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://olxwuzvzqvqkmdikzewj.supabase.co';
const supabaseKey = 'sb_publishable_6c6XcJEj10ImaSmOlmX0_g_NZ1lgsjX';

export const supabase = createClient(supabaseUrl, supabaseKey);