import { Inter } from "next/font/google";
import "./globals.css";
import BottomNavigation from "@/components/BottomNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Driver App",
  description: "Delivery Driver Application",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="pb-16">
          {" "}
          {/* Add padding bottom for navigation */}
          {children}
        </main>
        <BottomNavigation />
      </body>
    </html>
  );
}
