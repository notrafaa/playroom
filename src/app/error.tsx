"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="shell empty"><div><div className="empty-icon">!</div><h1>Petit accident de jeu.</h1><p>L’état réel est conservé. Tu peux relancer l’affichage sans perdre tes points.</p><button className="button" onClick={reset}>Réessayer</button></div></main>; }
