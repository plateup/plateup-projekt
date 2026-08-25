
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
    
    for (const post of postsData) {
      if (!post.workout_data || !Array.isArray(post.workout_data.exercises)) continue;
      
      post.workout_data.exercises.forEach(ex => {
        if (!ex || !Array.isArray(ex.sets)) return;
        
        if (!history[ex.name]) {
          const completedSets = ex.sets.filter(s => s && (s.isCompleted || (s.kg && s.reps)));
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
    
    const localHistory = JSON.parse(localStorage.getItem('plateup_exercise_history') || '{}');
    const mergedHistory = { ...history, ...localHistory };
    
    localStorage.setItem('plateup_exercise_history', JSON.stringify(mergedHistory));
    console.log('Successfully synced exercise history from cloud.');
  } catch (err) {
    console.error('Failed to sync history:', err);
  }
}
