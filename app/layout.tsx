import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global Job Finder | Find work across borders",
  description: "Discover international job opportunities and understand application and work-permit requirements.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
