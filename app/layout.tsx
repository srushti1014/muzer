import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ToastContainer } from 'react-toastify';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "https://muzer.100xdevs.com/",
  ),
  keywords:
    "music stream, fan interaction, live streaming, high-quality audio, curate music, Muzer",
  title: "Muzer | Fan-Curated Live Music Streaming",
  description:
    "Live fan-curated music streaming. High-quality audio, real-time engagement.",
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: `${process.env.NEXTAUTH_URL}/opengraph-image.png`,
    images: "/opengraph-image.png",
    siteName: "Infra",
  },
  icons: [
    {
      url: `${process.env.NEXTAUTH_URL}/favicon.ico`,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-[#1b1934b2]`}
      >
        <Providers>
          <ToastContainer />
          {children}
        </Providers>
      </body>
    </html>
  );
}
