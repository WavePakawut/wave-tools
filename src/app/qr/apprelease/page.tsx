import QrAppRelease from "@/components/QrAppRelease";
import React from "react";
import { Toaster } from "sonner";


const QrAppReleasePage = () => {
  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden py-6 sm:py-12 bg-gradient-to-tl from-cyan-400 via-purple-500 to-rose-500">
      <Toaster />
      <QrAppRelease />
    </div>
  );
};

export default QrAppReleasePage;
