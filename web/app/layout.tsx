import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reel — taste-driven film discovery",
  description:
    "A discovery layer on top of Letterboxd: explainable, personalized film recommendations from your own watch history.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
