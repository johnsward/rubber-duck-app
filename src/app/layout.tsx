import type { Metadata } from "next";
import "./globals.css";
import { Roboto } from "next/font/google";
import { LoadingProvider } from "./context/LoadingContext";

export const metadata: Metadata = {
  title: "Rubber Ducking",
  description: "Rubber duck simulator",
};

const background = {
  background: "linear-gradient(36deg, rgba(245,230,236,1) 56%, rgba(255,217,136,1) 100%)",
  fontFamily: "Roboto, sans-serif",
};


const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700", "500"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LoadingProvider>
    <html lang="en">
      <body className={roboto.className} style={background}>
        {children}
      </body>
    </html>
    </LoadingProvider>
  );
}
