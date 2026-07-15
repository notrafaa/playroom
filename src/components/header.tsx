import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { brand } from "@playroom/shared";
import { AuthButton } from "./auth-button";
import { SoundToggle } from "./sound-provider";
import { isDemoMode } from "@/lib/env";

export function Header() {
  return <header className="shell topbar">
    <Link href="/" className="logo"><span className="logo-mark"><Gamepad2 size={22} strokeWidth={3} /></span>{brand.name}</Link>
    <nav className="topnav" aria-label="Navigation principale">
      <Link href="/lobbies">Lobbies publics</Link>
      <span className="bot-pill"><span className="status-dot" />{isDemoMode ? "Bot simulé disponible" : "Statut du bot"}</span>
      <SoundToggle />
      <AuthButton />
    </nav>
  </header>;
}
