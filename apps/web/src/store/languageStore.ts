import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'id' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language: Language) => set({ language }),
      toggleLanguage: () =>
        set((state) => ({ language: state.language === 'en' ? 'id' : 'en' }))
    }),
    {
      name: 'void-rose-language'
    }
  )
);
