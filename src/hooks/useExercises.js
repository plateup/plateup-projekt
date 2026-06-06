import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export function useExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExercises = async () => {
    setLoading(true);
    
    // 1. Fetch from Supabase
    const { data: dbExercises, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');
    
    if (error) console.error("Error fetching exercises:", error);

    // 2. Fetch custom exercises from LocalStorage
    const localExercises = JSON.parse(localStorage.getItem('custom_exercises') || '[]');

    setExercises([...(dbExercises || []), ...localExercises]);
    setLoading(false);
  };

  const addCustomExercise = (newExercise) => {
    const localExercises = JSON.parse(localStorage.getItem('custom_exercises') || '[]');
    const updated = [...localExercises, { ...newExercise, id: `custom-${Date.now()}`, isCustom: true }];
    localStorage.setItem('custom_exercises', JSON.stringify(updated));
    setExercises(prev => [...prev, updated[updated.length - 1]]);
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  return { exercises, loading, addCustomExercise, refresh: fetchExercises };
}
