import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import {
  MessageSquare,
  X,
  Minus,
  Send,
  Mic,
  Sparkles,
  Bot,
  User,
  Stethoscope,
  ChevronRight,
  ShieldAlert,
  Volume2,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export const FloatingAssistant: React.FC = () => {
  const { language, activeRole, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic suggested question chips based on active language and portal
  const getSuggestedQuestions = () => {
    if (language === "hi") {
      return [
        "मरीज के रूप में पंजीकरण कैसे करें?",
        "अपॉइंटमेंट कैसे बुक करें?",
        "मेडिकल रिपोर्ट कहाँ देखें?",
        "अस्पताल कैसे खोजें?",
        "भाषा कैसे बदलें?",
        "डॉक्टर के रूप में लॉगिन कैसे करें?",
      ];
    } else if (language === "mr") {
      return [
        "रुग्ण म्हणून नोंदणी कशी करावी?",
        "अपॉइंटमेंट कशी बुक करावी?",
        "वैद्यकीय अहवाल कोठे पहावेत?",
        "रुग्णालये कशी शोधावीत?",
        "भाषा कशी बदलावी?",
        "डॉक्टर म्हणून लॉगिन कसे करावे?",
      ];
    }
    return [
      "How do I register as a patient?",
      "How do I book an appointment?",
      "Where can I view my reports?",
      "How do I search hospitals?",
      "How do I change the language?",
      "How do I log in as a doctor?",
    ];
  };

  const getWelcomeText = () => {
    if (language === "hi") {
      return "👋 जीवन सेतु में आपका स्वागत है! मैं आपकी एआई स्वास्थ्य सेवा सहायक (AI Nurse) हूँ। मैं आपको पोर्टल नेविगेट करने, सेवाओं की जानकारी देने, अपॉइंटमेंट और अस्पताल खोजने में मदद कर सकती हूँ।";
    } else if (language === "mr") {
      return "👋 जीवन सेतु मध्ये आपले स्वागत आहे! मी तुमची एआय आरोग्य सहाय्यक (AI Nurse) आहे. मी तुम्हाला पोर्टल वापरण्यास, नोंदणी, अपॉइंटमेंट आणि रुग्णालये शोधण्यात मदत करू शकते.";
    }
    return "👋 Welcome to Jeevan Setu! I'm your AI Healthcare Assistant (AI Nurse). I can help you navigate the platform, explain features, guide you through patient registration, booking appointments, and hospital search.";
  };

  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize or update welcome message when language changes
  useEffect(() => {
    setMessages([
      {
        id: "welcome-1",
        sender: "assistant",
        text: getWelcomeText(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          language,
          activeRole,
        }),
      });

      const data = await response.json();
      const assistantReply =
        data.reply ||
        (language === "hi"
          ? "मैं जीवन सेतु प्लेटफॉर्म का मार्गदर्शन करने के लिए यहाँ हूँ। आप शीर्ष मेनू से अस्पताल खोज सकते हैं, अपॉइंटमेंट बुक कर सकते हैं या एआई लक्षण जांच का उपयोग कर सकते हैं।"
          : language === "mr"
          ? "मी जीवन सेतु प्लॅटफॉर्मचे मार्गदर्शन करण्यासाठी येथे आहे. तुम्ही वरील मेनूमधून रुग्णालये शोधू शकता, अपॉइंटमेंट बुक करू शकता किंवा लक्षण तपासक वापरू शकता."
          : "I am here to guide you on Jeevan Setu. You can explore verified hospitals, book doctor appointments, or use the AI Symptom Checker from the top menu.");

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: assistantReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat assistant error:", err);
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text:
          language === "hi"
            ? "क्षमा करें, नेटवर्क में अस्थायी समस्या है। आप मरीज पोर्टल से अस्पताल खोज सकते हैं और अपॉइंटमेंट बुक कर सकते हैं।"
            : language === "mr"
            ? "क्षमस्व, नेटवर्कमध्ये तात्पुरती अडचण आहे. तुम्ही रुग्ण पोर्टलवरून रुग्णालये शोधू शकता आणि अपॉइंटमेंट बुक करू शकता."
            : "I am here to assist you. You can easily navigate to the Patient Portal, Hospital Registration, or Admin Dashboard from the top header.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInputClick = () => {
    setVoiceActive((prev) => !prev);
    if (!voiceActive) {
      // Provide a brief simulated voice listening prompt
      setTimeout(() => {
        setVoiceActive(false);
        const voiceQuery =
          language === "hi"
            ? "अपॉइंटमेंट कैसे बुक करें?"
            : language === "mr"
            ? "अपॉइंटमेंट कशी बुक करावी?"
            : "How do I book an appointment?";
        setInput(voiceQuery);
      }, 2500);
    }
  };

  const getPortalLabel = () => {
    switch (activeRole) {
      case "patient":
        return language === "hi" ? "मरीज पोर्टल" : language === "mr" ? "रुग्ण पोर्टल" : "Patient Portal";
      case "hospital_reg":
        return language === "hi" ? "अस्पताल पंजीकरण" : language === "mr" ? "रुग्णालय नोंदणी" : "Hospital Reg";
      case "hospital_mgmt":
        return language === "hi" ? "अस्पताल प्रबंधन" : language === "mr" ? "रुग्णालय व्यवस्थापन" : "Hospital Mgmt";
      case "admin":
        return language === "hi" ? "प्रशासकीय पोर्टल" : language === "mr" ? "प्रशासकीय पोर्टल" : "Admin Portal";
      default:
        return "Jeevan Setu";
    }
  };

  return (
    <div className="fixed bottom-22 right-3.5 sm:right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Expanded Chat Window */}
      {isOpen && !isMinimized && (
        <div className="mb-4 w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-7rem)] bg-white/95 backdrop-blur-2xl border border-[#D0BCFF] shadow-[0_20px_50px_rgba(103,80,164,0.3)] rounded-3xl overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#21005D] via-[#381E72] to-[#6750A4] text-white p-4 flex items-center justify-between border-b border-[#D0BCFF]/20 shadow-md">
            <div className="flex items-center gap-3">
              {/* 3D AI Nurse Avatar Badge */}
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#EADDFF] to-[#D0BCFF] border-2 border-white flex items-center justify-center text-[#21005D] shadow-inner font-extrabold text-lg">
                  👩‍⚕️
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#21005D] rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white font-serif tracking-tight">
                    Jeevan Setu AI Nurse
                  </h3>
                  <span className="bg-[#EADDFF]/20 text-[#EADDFF] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#EADDFF]/30">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-[#EADDFF]/80 flex items-center gap-1">
                  <Stethoscope className="w-3 h-3 text-emerald-300" />
                  <span>{getPortalLabel()}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[#EADDFF]">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FEF7FF]/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "assistant" && (
                  <div className="w-7 h-7 rounded-xl bg-[#6750A4] text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">
                    👩‍⚕️
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#6750A4] text-white rounded-br-none"
                      : "bg-white text-[#1C1B1F] border border-[#E2D9FF] rounded-bl-none shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line text-xs">{msg.text}</p>
                  <span
                    className={`text-[9px] mt-1 block font-medium ${
                      msg.sender === "user" ? "text-white/70 text-right" : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-xl bg-[#EADDFF] text-[#21005D] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 border border-[#D0BCFF]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-xl bg-[#6750A4] text-white flex items-center justify-center text-xs shrink-0 shadow-sm animate-pulse">
                  👩‍⚕️
                </div>
                <div className="bg-white border border-[#E2D9FF] rounded-2xl rounded-bl-none px-4 py-3 shadow-xs flex items-center gap-1.5 text-slate-500 text-xs">
                  <span className="w-1.5 h-1.5 bg-[#6750A4] rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-[#6750A4] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#6750A4] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-1 text-[11px] font-medium text-[#6750A4]">
                    {language === "hi" ? "एआई नर्स सोच रही है..." : language === "mr" ? "एआय नर्स विचार करत आहे..." : "AI Nurse is typing..."}
                  </span>
                </div>
              </div>
            )}

            {/* Suggested Question Chips */}
            {messages.length <= 2 && !loading && (
              <div className="pt-2">
                <p className="text-[10px] uppercase font-extrabold tracking-wider text-[#6750A4] mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {language === "hi" ? "सुझाए गए प्रश्न" : language === "mr" ? "सुचवलेले प्रश्न" : "Suggested Questions"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {getSuggestedQuestions().map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="text-left text-[11px] bg-white hover:bg-[#F4F0FF] text-[#21005D] border border-[#E2D9FF] hover:border-[#6750A4] px-2.5 py-1.5 rounded-xl transition-all cursor-pointer font-medium flex items-center gap-1 shadow-2xs"
                    >
                      <span>{q}</span>
                      <ChevronRight className="w-3 h-3 text-[#6750A4] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Listening Feedback Notice */}
          {voiceActive && (
            <div className="bg-amber-50 border-y border-amber-200 px-3 py-1.5 text-[11px] text-amber-900 flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-1.5 font-bold">
                <Volume2 className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                {language === "hi" ? "आवाज सुनें..." : language === "mr" ? "आवाज ऐका..." : "Listening to voice input..."}
              </span>
              <span className="text-[10px] text-amber-700">Say query</span>
            </div>
          )}

          {/* Footer Input Bar */}
          <div className="p-3 bg-white border-t border-[#E2D9FF] flex flex-col gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={handleVoiceInputClick}
                className={`p-2 rounded-xl transition-all cursor-pointer border ${
                  voiceActive
                    ? "bg-red-50 text-red-600 border-red-300 animate-pulse"
                    : "bg-[#F4F0FF] text-[#6750A4] hover:bg-[#EADDFF] border-[#E2D9FF]"
                }`}
                title="Voice Input (Future Ready)"
              >
                <Mic className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  language === "hi"
                    ? "जीवन सेतु एआई से पूछें..."
                    : language === "mr"
                    ? "जीवन सेतु एआय ला विचारा..."
                    : "Ask Jeevan Setu AI Assistant..."
                }
                className="flex-1 bg-[#FEF7FF] border border-[#D0BCFF] focus:border-[#6750A4] focus:ring-2 focus:ring-[#6750A4]/20 rounded-xl px-3 py-2 text-xs text-[#1C1B1F] placeholder-slate-400 outline-none transition-all"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-[#6750A4] hover:bg-[#523e85] disabled:opacity-40 text-white p-2 rounded-xl transition-all cursor-pointer shadow-sm shadow-[#6750A4]/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <p className="text-[9.5px] text-slate-400 text-center flex items-center justify-center gap-1">
              <ShieldAlert className="w-3 h-3 text-slate-400 shrink-0" />
              <span>
                {language === "hi"
                  ? "अस्वीकरण: मंच मार्गदर्शन के लिए। आपात स्थिति में डॉक्टर से परामर्श लें।"
                  : language === "mr"
                  ? "अस्वीकरण: मंच मार्गदर्शनासाठी. आपत्कालीन परिस्थितीत डॉक्टरांचा सल्ला घ्या."
                  : "Disclaimer: Platform guidance only. Consult a doctor for medical emergencies."}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Floating 3D AI Nurse Badge / Avatar Button */}
      {(!isOpen || isMinimized) && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#21005D] via-[#381E72] to-[#6750A4] text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-[0_10px_35px_rgba(103,80,164,0.4)] border-2 border-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer pointer-events-auto"
        >
          {/* Animated Glow Ring */}
          <span className="absolute -inset-1 rounded-full bg-[#6750A4]/30 blur-md group-hover:bg-[#6750A4]/50 transition-all pointer-events-none"></span>

          {/* Avatar Icon */}
          <div className="relative z-10 w-9 h-9 rounded-full bg-gradient-to-br from-[#EADDFF] to-[#D0BCFF] border border-white flex items-center justify-center text-lg shadow-inner text-[#21005D]">
            👩‍⚕️
          </div>

          <div className="relative z-10 text-left hidden sm:block">
            <span className="block text-xs font-extrabold text-white font-serif leading-tight">
              AI Nurse
            </span>
            <span className="block text-[9.5px] text-[#EADDFF] font-medium leading-tight">
              {getPortalLabel()}
            </span>
          </div>

          <Sparkles className="relative z-10 w-4 h-4 text-amber-300 animate-pulse hidden sm:block" />

          {/* Unread Indicator Badge */}
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-bold text-slate-900 shadow-sm animate-bounce">
              !
            </span>
          )}
        </button>
      )}
    </div>
  );
};
