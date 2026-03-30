import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from 'react-hot-toast';
import ThemeWrapper from '@/components/ThemeWrapper';
import GoogleProvider from '@/components/GoogleProvider';

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const fontClass = locale === 'bn' ? 'font-bangla' : 'font-body';

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={fontClass}>
        <NextIntlClientProvider messages={messages}>
          <ThemeWrapper>
            <GoogleProvider>
              <Toaster position="top-right" toastOptions={{
                style: { background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(16px)' },
              }} />
              {children}
            </GoogleProvider>
          </ThemeWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
