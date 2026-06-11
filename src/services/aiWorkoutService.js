/**
 * Plik: aiWorkoutService.js
 * Autorzy: Langier, Mietła, Jadwiszczok, Bogdański
 * Opis: Moduł odpowiedzialny za logikę powiązaną z services/aiWorkoutService.js.
 * Technologia: React / JSX / Tailwind CSS
 */

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
});

const systemPrompt = `You are a world-class AI Fitness Assistant. 
STRICT RULES:
1. ONLY answer questions about fitness, workouts, nutrition, exercise science, and bodybuilding.
2. If asked about programming, general knowledge, politics, hacks, or anything unrelated to fitness, you MUST refuse and say: "I am a specialized fitness assistant. I cannot help with that."
3. When the user asks for a workout routine or plan, respond conversationally, and then APPEND A STRICT JSON BLOCK at the very end of your response. 
The JSON block MUST be wrapped in \`\`\`json and \`\`\` and match this EXACT structure:
\`\`\`json
{
  "name": "Creative Name for the Routine",
  "exercises": [
    {
      "name": "Exercise Name",
      "muscle_group": "Chest/Back/Legs/Shoulders/Arms/Core/Cardio/Full Body",
      "sets": 3
    }
  ]
}
\`\`\`
DO NOT put anything after the JSON block. Do not include markdown inside the JSON object itself.
`;

export const generateWorkoutRoutine = async (chatHistory) => {
  try {
    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    const fullResponse = chatCompletion.choices[0]?.message?.content || "";
    let cleanText = fullResponse;
    let routine = null;

    // Try to extract JSON block if it exists
    const jsonMatch = fullResponse.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        routine = JSON.parse(jsonMatch[1]);
        // Remove the JSON block from the text shown to the user
        cleanText = fullResponse.replace(/```json\n[\s\S]*?\n```/, '').trim();
      } catch (e) {
        console.error("Failed to parse routine JSON from AI", e);
      }
    } else {
      // Fallback: Check if the whole response is just JSON
      try {
        if (fullResponse.trim().startsWith('{') && fullResponse.trim().endsWith('}')) {
          routine = JSON.parse(fullResponse.trim());
          cleanText = "Here is your routine:";
        }
      } catch (e) {
        // Not JSON
      }
    }

    return { text: cleanText, routine };
  } catch (error) {
    console.error("Groq AI Error:", error);
    throw new Error("Failed to generate response.");
  }
};