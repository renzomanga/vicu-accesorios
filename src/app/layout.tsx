import type { Metadata, Viewport } from "next";
import { Libre_Caslon_Display, Karla } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const libreCaslonDisplay = Libre_Caslon_Display({
  variable: "--font-caslon",
  weight: "400",
  subsets: ["latin"],
});

const karla = Karla({
  variable: "--font-karla",
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cantera Joyas",
  description: "Costos y precios de Cantera Joyas",
};

export const viewport: Viewport = {
  themeColor: "#7A6152",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${libreCaslonDisplay.variable} ${karla.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cantera-base text-cantera-ink">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
