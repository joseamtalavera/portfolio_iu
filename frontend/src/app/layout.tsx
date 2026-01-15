/**
 * Root layout wrapping all Next.js pages and providers.
 */
import "./globals.css";
import type { Metadata } from "next";
import { ClientProviders } from "../components/ClientProviders";

export const metadata: Metadata = {
  title: "BeWorking",
  description: "Virtual Office",
};

/**
 * Root layout component for the app.
 *
 * @param children page content
 * @returns HTML shell with providers
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
