// // app/recettes/[slug]/page.js
// import Link from "next/link";
// import RecetteImage from "@/app/components/RecetteImage";
// import RecetteInfos from "@/app/components/RecetteInfos";
// import ListeIngredients from "@/app/components/ListeIngredients";
// import ListeEtapes from "@/app/components/ListeEtapes";
// import AssistantVocal from "@/app/components/AssistantVocal";


// export default async function RecetteDetail({ params }) {
//   // 1️⃣ On récupère les données depuis WordPress
//   const res = await fetch(
//     `http://localhost/ok-chef-wp/wp-json/wp/v2/recettes?slug=${params.slug}&_embed`,
//     { cache: 'no-store' }
//   );

//   if (!res.ok) {
//     return <div>Erreur lors du chargement de la recette</div>;
//   }

//   const data = await res.json();
//   const recette = data[0];

//   // 2️⃣ Si aucune recette trouvée
//   if (!recette) {
//     return <div>Recette introuvable</div>;
//   }

//   // récupérer de l'image mise en avant (featured image)
//   const featuredImage =
//     recette._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;

//   // récupérer des champs ACF
//   const acf = recette.acf || {};

//   return (
//     <article className="p-6">
//       <Link href="/recettes" className="mb-6 text-2xl font-caveat hover:underline">
//         <h1>{'<'} Retour</h1>
//       </Link>
//       <div className="flex justify-between p-6">
//           <RecetteImage recette={recette} featuredImage={featuredImage} />
//         {/* Infos de la recette */}
//         <div className="w-1/2 h-[65vh] flex flex-col break-words">
//           <h1 className="text-6xl font-bold mb-4 font-caveat">{recette.title.rendered}</h1>
//           <RecetteInfos acf={acf} taxonomies={recette._embedded?.['wp:term']} />
//           {/* assistant vocal sera ici */}
//           <AssistantVocal />
//           {/* Liste des ingrédients et étapes */}
//           <div className="flex-grow font-quicksand w-full overflow-y-auto pr-2">
//             {acf.ingredients?.length > 0 && <ListeIngredients ingredients={acf.ingredients} />}
//             {acf.etapes?.length > 0 && <ListeEtapes etapes={acf.etapes} />}
//           </div>
//         </div>
//       </div>

//       {/* description */}
//       {/* <div
//         className="prose max-w-none"
//         dangerouslySetInnerHTML={{ __html: recette.content.rendered }}
//       /> */}
//     </article>
//   );
// }

// app/recettes/[slug]/page.js
"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import RecetteImage from "@/app/components/RecetteImage";
import RecetteInfos from "@/app/components/details/RecetteInfos";
import ListeIngredients from "@/app/components/details/ListeIngredients";
import ListeEtapes from "@/app/components/details/ListeEtapes";
// import AssistantVocal from "@/app/components/assistant/AssistantVocal";
import AssistantVocalTest from "@/app/components/assistant/AssistantVocalTest";

export default function RecetteDetail({ params }) {
    // Unwrap params avec React.use()
    const resolvedParams = use(params);
    const slug = resolvedParams.slug;

    // États pour les données
    const [recette, setRecette] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // État pour gérer quelle étape est ouverte
    const [etapeOuverte, setEtapeOuverte] = useState(null);

    // Fonction appelée par l'assistant vocal pour changer d'étape
    // const handleChangeEtape = (numeroEtape) => {
    //     setEtapeOuverte(numeroEtape);
    // };

    // Fetch des données au montage du composant
    useEffect(() => {
        const fetchRecette = async () => {
            try {
                const res = await fetch(
                    `http://localhost/ok-chef-wp/wp-json/wp/v2/recettes?slug=${slug}&_embed`,
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

    // États de chargement et d'erreur
    if (loading) {
        return <div className="p-6 flex justify-center items-center font-caveat font-bold h-screen">Chargement de la recette...</div>;
    }

    if (error) {
        return <div className="p-6">Erreur : {error}</div>;
    }

    if (!recette) {
        return <div className="p-6">Recette introuvable</div>;
    }

    // Extraction des données
    const featuredImage = recette._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
    const acf = recette.acf || {};

    return (
        <article className="p-6">
            <h1 className="mb-6 text-sm md:text-lg lg:text-2xl font-caveat">{'<'}<Link href="/recettes" className="ml-1 hover:underline">Retour</Link></h1>

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

            {/* <AssistantVocal
                etapes={acf.etapes || []}
                changeEtape={handleChangeEtape}
            /> */}
            <AssistantVocalTest
                etapes={acf.etapes || []}
                // changeEtape={handleChangeEtape}
            />
        </article>
    );
}