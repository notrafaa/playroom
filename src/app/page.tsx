import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GameCard } from "@/components/game-card";
import { BotStatusCard } from "@/components/bot-status-card";

export default function HomePage() {
  return <main>
    <section className="shell hero">
      <div><p className="eyebrow">Le terrain de jeu de tes vocaux</p><h1>Parle. Bluffe. <span>Buzze.</span></h1><p className="hero-copy">Des mini-jeux sociaux conçus pour transformer une soirée Discord ordinaire en chaos parfaitement organisé.</p><div style={{ marginTop: 24 }}><Link href="/lobbies/create" className="button button-primary">Créer une partie <ArrowRight size={18} /></Link></div></div>
      <aside className="hero-sticker">Discord garde les voix.<small>Playroom s’occupe des secrets, des points et des coups bas.</small></aside>
    </section>
    <div className="shell"><BotStatusCard /></div>
    <section className="shell">
      <div className="section-title"><div><p className="eyebrow">Choisis ton chaos</p><h2>Les expériences</h2></div><p>Une règle suffit. Tes amis font le reste.</p></div>
      <div className="game-grid">
        <GameCard title="OBJECTIF SECRET" description="Réalise tes missions en vocal sans te faire repérer." color="yellow" art="buzzer" available href="/games/objective-secret" />
        <GameCard title="RÈGLE CACHÉE" description="Tout le monde connaît la règle… sauf toi." color="purple" art="question" futurePitch="Un joueur ignore la règle qui gouverne la conversation. Il doit la deviner avant d’accumuler trop de pénalités, pendant que les autres tentent de rester naturels." />
        <GameCard title="SABOTEUR" description="Réussissez l’épreuve avant que l’imposteur ne la détruise." color="mint" art="sabotage" futurePitch="Le groupe relève des défis courts en vocal. Un saboteur secret reçoit des occasions discrètes de faire échouer l’équipe sans être démasqué." />
      </div>
    </section>
  </main>;
}
