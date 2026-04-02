import { GoogleGenAI, Type } from "@google/genai";
import { DBT_SKILLS, type AIResponse } from "../types";

// En AI Studio se usa process.env.GEMINI_API_KEY.
// En un entorno Vite estándar fuera de AI Studio, se usa import.meta.env.VITE_GEMINI_API_KEY.
const apiKey = process.env.GEMINI_API_KEY || (import.meta.env.VITE_GEMINI_API_KEY as string) || "";

const ai = new GoogleGenAI({ apiKey });

export async function analyzeEmotions(text: string): Promise<AIResponse> {
  if (!apiKey) {
    throw new Error("Clave de API de Gemini no encontrada. Por favor, configura VITE_GEMINI_API_KEY en tu archivo .env.");
  }
  const model = "gemini-3-flash-preview";
  
  const skillsContext = DBT_SKILLS.map(s => `${s.id}: ${s.name} (${s.module}) - ${s.description}`).join('\n');

  const prompt = `
    Jesteś ekspertem w dziedzinie Terapii Dialektyczno-Behawioralnej (DBT). 
    Użytkownik podzielił się następującymi przemyśleniami i emocjami:
    "${text}"

    Twoim zadaniem jest:
    1. Krótko przeanalizować, co dzieje się z użytkownikiem (empatyczna walidacja).
    2. Zidentyfikować główne emocje (np. lęk, złość, smutek, wstyd, poczucie winy).
    3. Zasugerować konkretne umiejętności DBT z podanej listy, które najlepiej odpowiadają tym emocjom:
       - Jeśli wykryjesz silny lęk, panikę lub kryzys, priorytetyzuj TIPP lub STOP.
       - Jeśli wykryjesz potrzebę odwrócenia uwagi od bólu, zasugeruj ACCEPTS.
       - Jeśli wykryjesz problemy w relacjach lub trudności w komunikacji, priorytetyzuj DEAR MAN.
       - Jeśli użytkownik chce utrzymać relację, zasugeruj GIVE.
       - Jeśli użytkownik musi zachować szacunek do siebie, zasugeruj FAST.
       - Jeśli wykryjesz zagubienie, impulsywność lub potrzebę równowagi, priorytetyzuj Mądry Umysł.
       - Jeśli użytkownik opisuje sytuację, która nie pasuje do jego emocji, zasugeruj Sprawdzanie Faktów lub Działanie Przeciwne.
    4. Udzielić praktycznej porady opartej na DBT.

    Dostępne umiejętności:
    ${skillsContext}

    Odpowiedz WYŁĄCZNIE w formacie JSON o następującej strukturze:
    {
      "analysis": "Twoja empatyczna analiza tutaj",
      "identifiedEmotions": ["emocja1", "emocja2"],
      "suggestedSkills": ["id-umiejętności1", "id-umiejętności2"],
      "advice": "Twoja praktyczna porada tutaj"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            identifiedEmotions: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            suggestedSkills: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            advice: { type: Type.STRING }
          },
          required: ["analysis", "identifiedEmotions", "suggestedSkills", "advice"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as AIResponse;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("No se pudo procesar tu solicitud en este momento.");
  }
}
