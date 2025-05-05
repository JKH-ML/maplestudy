"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function ObfuscatedEmail({ email }: { email: string }) {
  const [showFull, setShowFull] = useState(false);

  function obfuscate(email: string) {
    const [user, domain] = email.split("@");
    const visible = user.slice(0, 3) + "***";
    return `${visible}@${domain}`;
  }

  return (
    <div className="flex items-center gap-2">
      <span>{showFull ? email : obfuscate(email)}</span>
      <button
        type="button"
        onClick={() => setShowFull(!showFull)}
        className="text-muted-foreground hover:text-foreground transition"
      >
        {showFull ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
