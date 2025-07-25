// components/layouts/AuthLayout.tsx

import { useState } from "react";
import { RectangleHorizontal } from "lucide-react";
import Logo from "@/components/Logo"; // Make sure this exists or replace with plain text/logo img

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const [useImageBg, setUseImageBg] = useState(true);
  const [bgUrl, setBgUrl] = useState(() => {
    const randomId = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/id/${randomId}/2560/1440?blur=1`;
  });

  const toggleBg = () => {
    if (!useImageBg) {
      const randomId = Math.floor(Math.random() * 1000);
      setBgUrl(`https://picsum.photos/id/${randomId}/2560/1440?blur=1`);
    }
    setUseImageBg(!useImageBg);
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden text-gray-800">
      {/* Background Layer */}
      {useImageBg ? (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('${bgUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(1px) brightness(0.9)",
          }}
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-app-blue via-blue-100 to-blue-200" />
      )}

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-md py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Logo />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-extrabold text-app-blue drop-shadow-sm">
                Welcome to FurnXpert
              </h1>
              <p className="mt-2 text-gray-600 text-sm">
                Professional insulation system calculator for engineering applications
              </p>

              {/* Badge */}
              <div className="mt-5">
                <span className="inline-block animate-pulse bg-gradient-to-r from-app-blue via-blue-500 to-cyan-400 text-white font-semibold text-sm tracking-wide uppercase px-4 py-1.5 rounded-full shadow-lg ring-2 ring-white/40 backdrop-blur-md">
                  F<sub className="text-xs -ml-1 align-baseline">x</sub>-Account
                </span>
              </div>
            </div>
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/90 backdrop-blur-sm p-4 border-t text-center text-gray-500 text-sm">
          © 2025 Bitmutex Technologies. All rights reserved.
        </footer>
      </div>

      {/* Toggle Background Button */}
      <button
        className="fixed bottom-4 right-4 z-30 bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-300 rounded-full p-3 shadow-md transition"
        onClick={toggleBg}
        title="Toggle background"
      >
        <RectangleHorizontal className="h-5 w-5 text-gray-700" />
      </button>
    </div>
  );
};

export default AuthLayout;
