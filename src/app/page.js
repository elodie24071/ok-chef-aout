// app/page.js
import Hero from './components/accueil/Hero';
import RecettesRecentes from './components/accueil/RecettesRecentes';
import DecoHero from './components/accueil/DecoHero';
// récupération de l'image mise en avant
async function getRecettes() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_WP_URL}/wp-json/wp/v2/recettes?_embed`, { cache: 'no-store' });
  return res.json();
}

export default async function Home() {
  const recettes = await getRecettes();
  return (
    <section className="page-acueil overflow-x-hidden">
      <Hero />
      <DecoHero />
      <RecettesRecentes recettes={recettes} />
    </section>
  );
}