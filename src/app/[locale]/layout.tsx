import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";
import "../globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  const base = getSiteUrl();
  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL(base),
    title: {
      default: title,
      template: `%s · ${title}`,
    },
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        tr: "/tr",
        en: "/en",
        "x-default": "/tr",
      },
    },
    openGraph: {
      type: "website",
      siteName: "PDR Danışmanlık",
      title,
      description,
      url: `/${locale}`,
      locale: locale === "en" ? "en_US" : "tr_TR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
