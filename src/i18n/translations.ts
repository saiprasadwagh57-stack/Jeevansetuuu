import enJson from "../locales/en.json";
import hiJson from "../locales/hi.json";
import mrJson from "../locales/mr.json";

export type Language = "en" | "hi" | "mr";

export interface LanguageOption {
  code: Language;
  label: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "mr", label: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
];

export const translations = {
  en: enJson,
  hi: hiJson,
  mr: mrJson,
};
