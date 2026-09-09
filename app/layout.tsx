import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IT-Терапия — успешные IT-проекты начинаются с диалога",
  description: "Бизнес-игры, тренинги и экспертные форматы для успешной продажи, запуска и реализации IT-проектов.",
  icons: {
    icon: [{ url: "/it-therapy-icon-v3.svg", type: "image/svg+xml" }],
    shortcut: "/it-therapy-icon-v3.svg",
    apple: "/it-therapy-icon-v3.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
