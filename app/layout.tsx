import { Navbar } from "@/components/navbar";
import "./globals.css";
import { GeistSans } from "geist/font/sans";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>
        <div className="min-h-screen bg-gray-900 text-gray-100">

        <Navbar />
        {children}
        </div>
      </body>
    </html>
  );
}
