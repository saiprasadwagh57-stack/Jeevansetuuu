import { GoogleGenAI } from "@google/genai";

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
  // CORS setup
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
    const { message, history, language, activeRole } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required." });
    }

    const langName =
      language === "hi" ? "Hindi (हिन्दी)" : language === "mr" ? "Marathi (मराठी)" : "English";

    const systemInstruction = `You are Jeevan Setu's empathetic, warm, and highly knowledgeable AI Healthcare Assistant (AI Nurse) for India.
You assist patients, hospitals, doctors, and government administrators in navigating and using the Jeevan Setu platform.

PLATFORM KNOWLEDGE BASE:
1. Patient Portal: Patients can log in with full name & mobile number, search verified hospitals, filter by specialty/district, book doctor consultation slots, check live bed counts (ICU, Oxygen, General), view & download digital diagnostic reports & prescriptions uploaded by doctors, and use the AI Symptom Triager.
2. Hospital Registration: Unverified hospitals fill out government onboarding forms (category, license number, bed counts, accreditation proof document) for Govt Admin verification.
3. Hospital Management: Verified hospitals log in with Hospital ID (e.g. HOSP-1001) and password. They can manage doctors roster, accept/decline appointments, update bed inventory, and launch doctor consultation sessions.
4. Doctor Portal: Doctors log in with Doctor ID (e.g. DOC-101) and password. They see live patient bookings, perform clinical diagnoses, prescribe medicines with dosages, and attach diagnostic report files (PDF/JPG) for patients.
5. Admin Portal: Government healthcare administrators log in (e.g. ADMIN-101 / password) to review pending hospital registrations, verify official license documents, approve & issue login credentials, or reject non-compliant applications.
6. Language Switcher: Users can change language anytime between English, Hindi (हिन्दी), and Marathi (मराठी) using the 🌐 Language dropdown in the top navigation bar.

CRITICAL INSTRUCTIONS:
- Respond ONLY in ${langName}.
- Keep answers clear, friendly, concise, and structured with step-by-step guidance.
- Tailor context to the active portal (${activeRole || "General"}).
- If asked medical advice, give general educational information and recommend consulting a doctor or using the AI Symptom Checker. Always include a short medical disclaimer.`;

    const prompt = `User Message: "${message}"
Current Active Role / Portal: "${activeRole || "Patient"}"
Language to respond in: ${langName}

Provide a helpful, friendly, and structured AI Nurse response in ${langName}.`;

    let replyText = "";
    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash"];

    for (const modelName of modelsToTry) {
      try {
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
          },
        });

        replyText = response.text || "";
        if (replyText.trim().length > 0) {
          break;
        }
      } catch (mErr) {
        console.warn(`Assistant model ${modelName} call issue, trying next...`);
      }
    }

    if (replyText.trim().length > 0) {
      return res.status(200).json({ reply: replyText });
    }

    // Multilingual Fallbacks
    const q = message.toLowerCase();
    let fallbackReply = "";

    if (q.includes("register") || q.includes("पंजीकरण") || q.includes("नोंदणी")) {
      if (language === "hi") {
        fallbackReply =
          "मरीज के रूप में पंजीकरण करने के लिए:\n1. ऊपरी नेविगेशन बार में 'मरीज पोर्टल' पर जाएं।\n2. 'लॉगिन / मरीज खाता पंजीकृत करें' बटन पर क्लिक करें।\n3. अपना पूरा नाम और 10 अंकों का मोबाइल नंबर दर्ज करें।\n\nअस्पताल पंजीकरण के लिए शीर्ष नेविगेशन में 'अस्पताल पंजीकरण' टैब चुनें।";
      } else if (language === "mr") {
        fallbackReply =
          "रुग्ण म्हणून नोंदणी करण्यासाठी:\n1. वरील नेव्हिगेशन बारमध्ये 'रुग्ण पोर्टल' वर जा.\n2. 'लॉगिन / रुग्ण खाते नोंदणी करा' वर क्लिक करा.\n3. तुमचे पूर्ण नाव आणि १०-अंकी मोबाईल नंबर प्रविष्ट करा.\n\nरुग्णालय नोंदणीसाठी वरील 'रुग्णालय नोंदणी' टॅब निवडा.";
      } else {
        fallbackReply =
          "To register as a patient:\n1. Go to the 'Patient Portal' from the top navigation bar.\n2. Click the 'Patient Login / Register' button.\n3. Enter your full name and 10-digit mobile number.\n\nFor hospital onboarding, switch to the 'Hospital Registration' tab in the header.";
      }
    } else if (
      q.includes("appointment") ||
      q.includes("book") ||
      q.includes("अपॉइंटमेंट") ||
      q.includes("बुकिंग")
    ) {
      if (language === "hi") {
        fallbackReply =
          "अपॉइंटमेंट बुक करने के लिए:\n1. 'मरीज पोर्टल' में सत्यापित अस्पतालों की सूची ब्राउज़ करें।\n2. अपनी पसंद का अस्पताल चुनें और 'परामर्श बुक करें' पर क्लिक करें।\n3. डॉक्टर, तिथि, समय स्लॉट चुनें और अपने लक्षण लिखें।\n4. अपनी बुकिंग की पुष्टि करें। आप 'मेरे अपॉइंटमेंट' टैब में स्थिति देख सकते हैं।";
      } else if (language === "mr") {
        fallbackReply =
          "अपॉइंटमेंट बुक करण्यासाठी:\n1. 'रुग्ण पोर्टल' मध्ये प्रमाणित रुग्णालये पहा.\n2. रुग्णालय निवडून 'सल्लामसलत बुक करा' वर क्लिक करा.\n3. डॉक्टर, तारीख, वेळ आणि लक्षणे निवडा.\n4. बुकिंगची पुष्टी करा. तुम्ही 'माझे अपॉइंटमेंट्स' टॅबमध्ये स्थिती पाहू शकता.";
      } else {
        fallbackReply =
          "To book an appointment:\n1. Go to the Patient Portal and browse verified hospitals.\n2. Click 'Book Consultation' on your preferred hospital card.\n3. Select a doctor, consultation date, time slot, and describe your symptoms.\n4. Submit the booking. You can track status under 'My Appointments'.";
      }
    } else if (q.includes("language") || q.includes("भाषा")) {
      if (language === "hi") {
        fallbackReply =
          "भाषा बदलने के लिए, ऊपरी दाएं कोने में 🌐 भाषा मेनू पर क्लिक करें और अंग्रेजी (English), हिन्दी या मराठी में से चुनें। पूरा इंटरफ़ेस तुरंत बदल जाएगा!";
      } else if (language === "mr") {
        fallbackReply =
          "भाषा बदलण्यासाठी, वरील उजव्या कोपऱ्यात 🌐 भाषा मेनूवर क्लिक करा आणि इंग्रजी, हिंदी किंवा मराठी निवडा. पूर्ण वेबसाइट लगेच बदलेल!";
      } else {
        fallbackReply =
          "To change the language, click the 🌐 Language selector in the top right header menu and select English, Hindi, or Marathi. The entire application interface will translate instantly!";
      }
    } else {
      if (language === "hi") {
        fallbackReply =
          "नमस्ते! मैं आपकी जीवन सेतु एआई नर्स हूँ। आप मरीज पोर्टल से अस्पताल खोज सकते हैं, अपॉइंटमेंट बुक कर सकते हैं, रिपोर्ट देख सकते हैं या एआई लक्षण जांचकर्ता का उपयोग कर सकते हैं। अधिक सहायता के लिए आप पूछ सकते हैं!";
      } else if (language === "mr") {
        fallbackReply =
          "नमस्कार! मी तुमची जीवन सेतु एआय नर्स आहे. तुम्ही रुग्ण पोर्टलवरून रुग्णालये शोधू शकता, अपॉइंटमेंट बुक करू शकता, अहवाल पाहू शकता किंवा एआय लक्षण तपासक वापरू शकता. अधिक मदतीसाठी प्रश्न विचारा!";
      } else {
        fallbackReply =
          "Hello! I am your Jeevan Setu AI Healthcare Assistant. You can use Jeevan Setu to search verified hospitals, book doctor consultations, check live bed counts, view digital reports, or run AI symptom triaging. How else can I assist you?";
      }
    }

    return res.status(200).json({ reply: fallbackReply });
  } catch (err: any) {
    console.error("Error in assistant serverless function:", err);
    return res.status(200).json({
      reply:
        "I am here to guide you on the Jeevan Setu platform. You can explore verified hospitals, book doctor appointments, manage hospital beds, or run AI symptom triaging from the top navigation bar.",
    });
  }
}
