import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ElementsHeightsProvider } from "@/contexts/elements-heights-context/context";
import ModalContextProvider from "@/contexts/modal-context/context";
import RoomsContextProvider from "@/contexts/rooms-context/context";
import AppModal from "@/components/shared/AppModal";
import ToastProvider from "./providers/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hotel Management System",
  description: "Discover comfort, luxury, and unforgettable experiences at Hotel Radison",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ElementsHeightsProvider>
            <ModalContextProvider>
              <RoomsContextProvider>
                <AppModal />
                <ToastProvider />
                {children}
              </RoomsContextProvider>
            </ModalContextProvider>
          </ElementsHeightsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
