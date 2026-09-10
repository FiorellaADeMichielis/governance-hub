import { useTranslation } from '../../i18n/useTranslation';
import type { SupportedLanguage } from '../../i18n/types';
import { IconGlobe } from './Icons';

interface LanguageSelectorProps {
  className?: string;
  showIcon?: boolean;
}

export const LanguageSelector = ({ className = '', showIcon = true }: LanguageSelectorProps) => {
  const { language, setLanguage } = useTranslation();

  const languages: { code: SupportedLanguage; label: string; short: string }[] = [
    { code: 'es', label: 'Español', short: 'ES' },
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'pt', label: 'Português', short: 'PT' },
  ];

  return (
    <div className={`inline-flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-lg text-xs ${className}`}>
      {showIcon && (
        <span className="pl-1.5 pr-0.5 text-stone-400 dark:text-stone-500" title="Language / Idioma">
          <IconGlobe className="w-3.5 h-3.5" />
        </span>
      )}
      <div className="flex items-center gap-0.5">
        {languages.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              title={lang.label}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all ${
                isActive
                  ? 'bg-white dark:bg-stone-900 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {lang.short}
            </button>
          );
        })}
      </div>
    </div>
  );
};

