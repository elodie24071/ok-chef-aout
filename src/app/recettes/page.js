'use client';
import { useState, useEffect, useCallback } from 'react';
import CarteRecette from '../components/page-recette/CarteRecette';
import FiltreRecettes from '../components/page-recette/FiltreRecettes';

async function getRecettes() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_WP_URL}/wp-json/wp/v2/recettes?_embed`, { cache: 'no-store' });

  return res.json();
}

export default function RecettesPage() {
  const [recettes, setRecettes] = useState([]);
  const [filtreRecettes, setFiltreRecettes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // charger les recettes
  useEffect(() => {
    getRecettes()
      .then(data => {
        setRecettes(data);
        setFiltreRecettes(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Erreur lors du chargement des recettes:', error);
        setIsLoading(false);
      });
  }, []);

  // callback pour recevoir les recettes filtrées (mémorisé pour éviter les re-renders)
  const handleFilteredRecettes = useCallback((recettesFiltrees) => {
    setFiltreRecettes(recettesFiltrees);
  }, []);

  if (isLoading) {
    return (
      <section className='flex flex-col items-center p-6'>
        <div className="text-center">
          <p className="lg:text-4xl flex justify-center items-center font-caveat font-bold h-screen">Chargement des recettes...</p>
        </div>
      </section>
    );
  }

  return (
    <section className='flex flex-col items-center p-6'>
      <h1 className="text-xl md:text-2xl lg:text-4xl font-bold mb-6 font-caveat">
        Nos Recettes
      </h1>

      {/* filtre */}
      <FiltreRecettes
        recettes={recettes}
        onFilteredRecettes={handleFilteredRecettes}
      />

      {/* grille recettes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {filtreRecettes.map((recette) => (
          <CarteRecette key={recette.id} recette={recette} />
        ))}
      </div>

      {/* msg si aucune recette trouvée */}
      {filtreRecettes.length === 0 && recettes.length > 0 && (
        <div className="text-center mt-8 h-[40vh]">
          <p className="text:xs md:text-lg font-quicksand text-brun">
            Aucune recette ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou appuyer sur <span className='font-caveat text-base md:text-lg'>Reset</span>
          </p>
        </div>
      )}
    </section>
  );
}