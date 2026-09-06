import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { PontoProvider } from "@/lib/store/ponto-store";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Ponto — Planos entre grupos",
  description:
    "Criem um grupo, digam o que vos apetece fazer e conheçam outro grupo.",
};

export const viewport: Viewport = {
  themeColor: "#0B0B0F",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-PT"
      className={`dark ${geist.variable} ${geistMono.variable}`}
    >
      <body className="antialiased">
        <PontoProvider>
          {children}
          <Toaster richColors position="top-center" />
        </PontoProvider>
      </body>
    </html>
  );
}
