/**
 * Plik: supabaseClient.js
 * Autorzy: Langier, Mietła, Jadwiszczok, Bogdański
 * Opis: Konfiguracja i inicjalizacja połączenia z bazą danych Supabase. Exportuje instancję klienta używaną w całej aplikacji.
 * Technologia: React / JSX / Tailwind CSS
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
