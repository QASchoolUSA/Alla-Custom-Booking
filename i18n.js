import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
  
  // Add validation and fallback
  const validLocales = ['en', 'ru', 'ua'];
  
  // Ensure that the incoming locale is valid
  if (!locale || !validLocales.includes(locale)) {
    locale = 'en';
  }
  
  const validatedLocale = locale;
  
  try {
    return {
      locale: validatedLocale,
      messages: (await import(`./messages/${validatedLocale}.json`)).default
    };
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    // Fallback to English
    return {
      locale: 'en',
      messages: (await import(`./messages/en.json`)).default
    };
  }
});