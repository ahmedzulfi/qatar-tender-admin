'use client';

import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { useEffect } from 'react';
import i18n from '../i18n';

export function useTranslation(ns: string = 'common') {
  const result = useI18nextTranslation(ns);
  
  useEffect(() => {
    if (!i18n.isInitialized) {
      i18n.init();
    }
  }, []);
  
  return result;
}
