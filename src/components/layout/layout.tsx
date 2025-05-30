
import React from "react";
import { Navbar } from "./navbar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4">
        {children}
      </main>
    </div>
  );
}
