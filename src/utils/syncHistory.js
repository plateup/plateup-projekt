
import { supabase } from '../services/supabaseClient';

export async function syncUserHistory(userId) {
  if (!userId) return;
  try {
    const { data: postsData, error } = await supabase
      .from('posts')
      .select('workout_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error || !postsData) return;

    const history = {};
    
    // We iterate from oldest to newest so newest overwrites oldest, 
    // OR we iterate newest to oldest and only set if not exists.
    // newest to oldest is better.
    for (const post of postsData) {
      if (!post.workout_data || !post.workout_data.exercises) continue;
      
      post.workout_data.exercises.forEach(ex => {
        if (!history[ex.name]) {
          const completedSets = ex.sets.filter(s => s.isCompleted || (s.kg && s.reps));
          if (completedSets.length > 0) {
            history[ex.name] = completedSets.map(s => ({
              kg: s.kg || '',
              reps: s.reps || '',
              rpe: s.rpe || ''
            }));
          }
        }
      });
    }
    
    // Merge with local history to not lose any pending local changes
    const localHistory = JSON.parse(localStorage.getItem('plateup_exercise_history') || '{}');
    const mergedHistory = { ...history, ...localHistory };
    
    localStorage.setItem('plateup_exercise_history', JSON.stringify(mergedHistory));
    console.log('Successfully synced exercise history from cloud.');
  } catch (err) {
    console.error('Failed to sync history:', err);
  }
}
