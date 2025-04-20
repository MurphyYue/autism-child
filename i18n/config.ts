export type Locale = (typeof locales)[number];

export const locales = ['en', 'zh'] as const;
// set default locale by current browser language
export const defaultLocale: Locale = 'zh';