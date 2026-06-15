import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Lang } from './translations'
import { t, type TranslationKey } from './translations'

interface LanguageCtx {
  lang: Lang
  setLang: (l: Lang) => void
  toggleLang: () => void
  t: (key: TranslationKey) => string
}

const Ctx = createContext<LanguageCtx>({
  lang: 'zh',
  setLang: () => {},
  toggleLang: () => {},
  t: () => '',
})

const STORAGE_KEY = 'agent-foundry-lang'

function loadLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'zh' || stored === 'en') return stored
  } catch {}
  return 'zh' // default Chinese
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang)

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch {}
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'zh' ? 'en' : 'zh')
  }, [lang, setLang])

  const translate = useCallback(
    (key: TranslationKey) => t(key, lang),
    [lang],
  )

  return (
    <Ctx.Provider value={{ lang, setLang, toggleLang, t: translate }}>
      {children}
    </Ctx.Provider>
  )
}

export function useLang() {
  return useContext(Ctx)
}
