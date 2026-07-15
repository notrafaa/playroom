import Link from "next/link";
export default function NotFound() { return <main className="shell empty"><div><div className="empty-icon">404</div><h1>Cette salle n’existe pas.</h1><p>Elle a peut-être expiré, ou quelqu’un a mangé le code.</p><Link className="button" href="/">Retour à l’accueil</Link></div></main>; }
