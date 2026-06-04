import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Navi Borrow-Safe — Rejection → Recovery → Responsible Borrowing",
  description:
    "Diagnose your loan rejection in plain language, get a 90-day recovery plan, and simulate safe borrowing before you apply again.",
  openGraph: {
    title: "Navi Borrow-Safe",
    description: "Turn a loan rejection into your comeback plan.",
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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        <NavBar />
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-100 bg-white/60 backdrop-blur-sm py-6">
          <div className="max-w-2xl mx-auto px-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="text-xs font-semibold text-slate-700">
                Kanik Kumar
                <span className="text-slate-400 font-normal ml-1.5">· BITS Pilani &apos;27 · CSE</span>
              </p>
              <a
                href="mailto:f20230575@pilani.bits-pilani.ac.in"
                className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
              >
                f20230575@pilani.bits-pilani.ac.in
              </a>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>PM Portfolio Project</span>
              <span className="text-slate-200">·</span>
              <a
                href="https://github.com/Kanik0575/navi-borrow-safe"
                className="hover:text-slate-600 transition-colors flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                GitHub
              </a>
              <span className="text-slate-200">·</span>
              <a
                href="https://linkedin.com/in/kanikchaudhary"
                className="hover:text-slate-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
