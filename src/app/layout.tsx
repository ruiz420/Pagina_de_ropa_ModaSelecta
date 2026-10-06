import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { AppProviders } from "@/components/layout/app-providers";
import { STORE } from "@/config/store";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: STORE.name,
    template: `%s | ${STORE.name}`,
  },
  description:
    "Prendas seleccionadas, belleza y accesorios para estrenar con estilo.",
  openGraph: {
    title: STORE.name,
    description:
      "Prendas seleccionadas, belleza y accesorios para estrenar con estilo.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
