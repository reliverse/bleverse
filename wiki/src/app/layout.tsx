import { RootProvider } from "fumadocs-ui/provider/next";

import "./global.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

const metadataBase =
  process.env.NEXT_PUBLIC_DOCS_URL != null
    ? new URL(process.env.NEXT_PUBLIC_DOCS_URL)
    : new URL("https://bleverse.com");

export const metadata: Metadata = {
  metadataBase,
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
