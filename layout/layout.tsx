import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import React from "react";

function Layout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: ClassValue;
}) {
  return (
    <div className="min-h-screen">
      {" "}
      <div className="fixed top-0 z-50 w-full bg-white flex items-center justify-between p-4 px-6 border-b shadow-sm">
        <div className="text-xl font-bold">Logo</div>
        <div />
      </div>
      <div className="pt-20 px-4">
        <main className={cn("flex flex-col gap-3", className)}>{children}</main>
      </div>
    </div>
  );
}

export default Layout;
