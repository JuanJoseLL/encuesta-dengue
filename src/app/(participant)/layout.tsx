import type { ReactNode } from "react";

export default function ParticipantLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950/5">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-10">
        {children}
      </div>
    </div>
  );
}
