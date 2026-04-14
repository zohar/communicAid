import { useLanguage } from '../../hooks/useLanguage';
import { supportedLanguages, languageConfigs } from '../../data/translations';
import { Language } from '../../types';

const languageFlags: Record<Language, string> = {
  en: '🇬🇧',
  he: '🇮🇱',
  ar: '🇸🇦',
  ru: '🇷🇺',
};

export function LanguagePicker() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-4">
      {supportedLanguages.map((lang) => {
        const config = languageConfigs[lang];
        const isActive = language === lang;
        return (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all shadow-md min-h-[90px] border-4 font-bold ${
              isActive
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 active:bg-slate-100'
            }`}
          >
            <span className="text-4xl">{languageFlags[lang]}</span>
            <span className="text-xl">{config.name}</span>
          </button>
        );
      })}
    </div>
  );
}
