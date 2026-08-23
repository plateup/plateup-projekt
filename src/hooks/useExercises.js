/**
 * Plik: useExercises.js
 * Autorzy: Langier, Mietła, Jadwiszczok, Bogdański
 * Opis: Moduł odpowiedzialny za logikę powiązaną z hooks/useExercises.js.
 * Technologia: React / JSX / Tailwind CSS
 */

import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { EXTENDED_EXERCISES } from '../constants/exercises';

export function useExercises() {
  // Stan przechowujący zmienną: exercises
  const [exercises, setExercises] = useState([]);
  // Stan przechowujący zmienną: loading
  const [loading, setLoading] = useState(true);

  // Asynchroniczna funkcja: fetchExercises - odpowiada za operacje w tle (np. fetchowanie bazy)

  const fetchExercises = async () => {
    setLoading(true);
    
    // 1. Fetch from Supabase
    // Odpytanie bazy danych Supabase w poszukiwaniu odpowiednich rekordów
    const { data: dbExercises, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');
    
    if (error) console.error("Error fetching exercises:", error);

    // 2. Fetch custom exercises from LocalStorage
    const localExercises = JSON.parse(localStorage.getItem('custom_exercises') || '[]');

    // Combine DB, Extended static list, and Local custom exercises
    const allExercises = [...(dbExercises || []), ...EXTENDED_EXERCISES, ...localExercises];
    
    // Deduplicate by name just in case some extended were added to DB
    const uniqueExercises = Array.from(new Map(allExercises.map(item => [item.name, item])).values());
    
    // Sort alphabetically
    uniqueExercises.sort((a, b) => a.name.localeCompare(b.name));

    setExercises(uniqueExercises);
    setLoading(false);
  };

  // Funkcja pomocnicza: addCustomExercise

  const addCustomExercise = (newExercise) => {
    const localExercises = JSON.parse(localStorage.getItem('custom_exercises') || '[]');
    const updated = [...localExercises, { ...newExercise, id: `custom-${Date.now()}`, isCustom: true }];
    localStorage.setItem('custom_exercises', JSON.stringify(updated));
    setExercises(prev => [...prev, updated[updated.length - 1]]);
  };

  // Efekt uboczny (useEffect) uruchamiany po wyrenderowaniu komponentu lub zmianie zależności

  useEffect(() => {
    fetchExercises();
  }, []);

  return { exercises, loading, addCustomExercise, refresh: fetchExercises };
}
