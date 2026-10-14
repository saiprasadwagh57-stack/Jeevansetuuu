import { GoogleGenAI, Type } from "@google/genai";

function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "jeevansetu-healthcare",
      },
    },
  });
}

export default async function handler(req: any, res: any) {
  // Enable CORS if needed
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { symptoms, language } = req.body || {};
    if (!symptoms || typeof symptoms !== "string") {
      return res.status(400).json({ error: "Symptoms text is required." });
    }

    const langName =
      language === "hi" ? "Hindi (हिन्दी)" : language === "mr" ? "Marathi (मराठी)" : "English";

    const prompt = `Analyze the following patient symptoms for a healthcare triage system in India.
Patient Symptoms (can be in English, Hindi, or Marathi): "${symptoms}"

CRITICAL INSTRUCTION:
Write all responses, medical guidance, warning signs, and advice in ${langName}.
Maintain high clinical accuracy, reassuring empathy, and clear instructions in ${langName}.

Provide structured triage JSON advice.`;

    const systemInstruction = `You are Jeevan Setu's empathetic, clinical-but-warm AI medical assistant for India. Respond in ${langName}. Give structured triage JSON advice.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        likely_specialty: {
          type: Type.STRING,
          description:
            "Medical specialty needed e.g. Cardiology, Neurology, Pediatrics, Orthopedics, General Medicine, Gastroenterology, ENT, Dermatology, Gynecology, Pulmonology, Emergency Medicine",
        },
        urgency: {
          type: Type.STRING,
          description: "Urgency level: low, medium, or high",
        },
        guidance_text: {
          type: Type.STRING,
          description: `Empathetic, clear plain-language guidance in ${langName} and recommended immediate first-aid/steps for the patient.`,
        },
        search_query: {
          type: Type.STRING,
          description:
            "Suggested filter term or specialty to search for relevant hospitals and doctors.",
        },
        warning_signs: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: `Key red flag symptoms in ${langName} that require immediate ER visit.`,
        },
      },
      required: ["likely_specialty", "urgency", "guidance_text", "search_query"],
    };

    let resultData = null;
    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash"];

    for (const modelName of modelsToTry) {
      try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        const jsonText = response.text || "{}";
        resultData = JSON.parse(jsonText);
        if (resultData && resultData.likely_specialty) {
          break;
        }
      } catch (modelErr) {
        console.warn(`Gemini model ${modelName} call issue, trying next...`, modelErr);
      }
    }

    if (resultData) {
      return res.status(200).json(resultData);
    }

    // Multilingual Fallbacks
    if (language === "hi") {
      return res.status(200).json({
        likely_specialty: "General Medicine",
        urgency: "medium",
        guidance_text:
          "आपके लक्षणों के आधार पर, हम पूरी नैदानिक जांच के लिए सामान्य चिकित्सक या विशेषज्ञ से परामर्श करने की सलाह देते हैं।",
        search_query: "General Medicine",
        warning_signs: ["तेज बुखार (>102°F)", "सांस लेने में तकलीफ", "छाती में तेज दर्द"],
      });
    } else if (language === "mr") {
      return res.status(200).json({
        likely_specialty: "General Medicine",
        urgency: "medium",
        guidance_text:
          "तुमच्या लक्षणांच्या आधारे, आम्ही सर्वकष वैद्यकीय तपासणीसाठी सामान्य वैद्य (General Physician) किंवा तज्ज्ञांचा सल्ला घेण्याची शिफारस करतो.",
        search_query: "General Medicine",
        warning_signs: ["तीव्र ताप (>१०२°F)", "श्वास घेण्यास त्रास", "छातीत तीव्र वेदना"],
      });
    }

    return res.status(200).json({
      likely_specialty: "General Medicine",
      urgency: "medium",
      guidance_text:
        "Based on your symptoms, we recommend consulting a General Physician or Specialist for a thorough evaluation. Please monitor your temperature and stay hydrated.",
      search_query: "General Medicine",
      warning_signs: ["High persistent fever (>102°F)", "Difficulty breathing", "Severe chest pain"],
    });
  } catch (err: any) {
    console.error("Error in symptom-checker serverless function:", err);
    return res.status(200).json({
      likely_specialty: "General Medicine",
      urgency: "medium",
      guidance_text:
        "Based on your symptoms, we recommend consulting a General Physician or Specialist for a thorough evaluation.",
      search_query: "General Medicine",
      warning_signs: ["Severe chest pain", "Difficulty breathing"],
    });
  }
}
