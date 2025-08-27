// app/recettes/[slug]/page.js
"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import RecetteImage from "@/app/components/RecetteImage";
import RecetteInfos from "@/app/components/details/RecetteInfos";
import ListeIngredients from "@/app/components/details/ListeIngredients";
import ListeEtapes from "@/app/components/details/ListeEtapes";
import AssistantVocal from "@/app/components/details/AssistantVocal";

export default function RecetteDetail({ params }) {
    const resolvedParams = use(params);
    const slug = resolvedParams.slug;

    const [recette, setRecette] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [etapeOuverte, setEtapeOuverte] = useState(null);

    // changer d'étape
    const handleChangeEtape = (numeroEtape) => {
        // ouvre l'étape correspondante
        setEtapeOuverte(numeroEtape);

        // scroll vers l'étape
        setTimeout(() => {
            const etapeElement = document.querySelector(`[data-etape-index="${numeroEtape}"]`);
            if (etapeElement) {
                etapeElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }
        }, 100);
    };

    // charger les données de la recette
    useEffect(() => {
        const fetchRecette = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_WP_URL}/wp-json/wp/v2/recettes?slug=${slug}&_embed`,
                    { cache: 'no-store' }
                );

                if (!res.ok) {
                    throw new Error('Erreur lors du chargement de la recette');
                }

                const data = await res.json();
                const recetteData = data[0];

                if (!recetteData) {
                    throw new Error('Recette introuvable');
                }

                setRecette(recetteData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRecette();
    }, [slug]);

    if (loading) {
        return <div className="p-6 lg:text-4xl flex justify-center items-center font-caveat font-bold h-screen">Chargement de la recette...</div>;
    }

    if (error) {
        return <div className="p-6 lg:text-4xl flex justify-center items-center font-caveat font-bold h-screen">Erreur : {error}</div>;
    }

    if (!recette) {
        return <div className="p-6 lg:text-4xl flex justify-center items-center font-caveat font-bold h-screen">Recette introuvable</div>;
    }

    // récupérer l'image mise en avant
    const featuredImage = recette._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
    const acf = recette.acf || {};

    return (
        <article className="p-6">
            <h1 className="mb-4 text-sm md:text-lg lg:text-2xl font-caveat">{'<'}<Link href="/recettes" className="ml-1 hover:underline">Retour</Link></h1>

            <div className="flex flex-col lg:flex-row lg:justify-between p-6">
                <RecetteImage recette={recette} featuredImage={featuredImage} />

                <div className="w-full lg:w-1/2 lg:h-[65vh] flex flex-col break-word">
                    <h1 className="text-xl md:text-4xl lg:text-6xl font-bold mb-4 font-caveat">
                        {recette.title.rendered}
                    </h1>

                    <RecetteInfos acf={acf} taxonomies={recette._embedded?.['wp:term']} />

                    <div className="flex-grow font-quicksand w-full overflow-y-auto pr-2">
                        {acf.ingredients?.length > 0 && (
                            <ListeIngredients ingredients={acf.ingredients} />
                        )}

                        {acf.etapes?.length > 0 && (
                            <ListeEtapes
                                etapes={acf.etapes}
                                etapeOuverte={etapeOuverte}
                                setEtapeOuverte={setEtapeOuverte}
                            />
                        )}
                    </div>
                </div>
            </div>

            <AssistantVocal
                etapes={acf.etapes || []}
                changeEtape={handleChangeEtape}
            />
        </article>
    );
}