// app/components/RecettesRecentes.js
'use client';
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function RecettesRecentes({ recettes }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fade, setFade] = useState(true);

    // Afficher 3 recettes recentes
    const RecettesRecentes = recettes.slice(0, 3);
    const recette = RecettesRecentes[currentIndex];

    const featuredImage = recette?._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;

    const prevRecette = () => {
        setFade(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex === 0 ? RecettesRecentes.length - 1 : prevIndex - 1));
            setFade(true);
        }, 500);
    }
    const nextRecette = () => {
        setFade(false);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex === RecettesRecentes.length - 1 ? 0 : prevIndex + 1));
            setFade(true);
        }, 500);
    }

    return (
        <div className='decouvrir flex flex-col justify-center text-center mt-10 md:mt-16 lg:mt-60 mb-16'>
            <h1 className="text:xl md:text-2xl lg:text-4xl font-bold mb-5 lg:mb-10 font-caveat">Découvrez nos recettes récentes</h1>
            <div className='flex justify-between items-center w-screen px-5 lg:px-20'>
                <button onClick={prevRecette} className='text-4xl lg:text-8xl mr-2 font-caveat'>{'<'}</button>
                {/* <h1 className='text-4xl lg:text-8xl mr-2 font-caveat'>{'<'}</h1> */}
                <div className='flex items-center lg:gap-6'>
                    <Image
                        src="/illu/fourchette.svg"
                        alt="Illustration d'une fourchette"
                        width={80}
                        height={0}
                        className="w-[clamp(40px,5vw,80px)] h-[clamp(140px,25vw,380px)]"
                    />
                    {/* <div className="relative flex transition-all duration-500 ease-in-out transform"> */}
                    <Link href={`/recettes/${recette.slug}`}>
                        <div className='relative flex'>
                            <Image
                                src="/illu/assiette.svg"
                                alt="Illustration d'une assiette"
                                width={550}
                                height={550}
                                className="w-[clamp(200px,30vw,550px)] h-auto transition-transform duration-500 hover:rotate-12"
                            />
                            <div className={`rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(120px,20vw,350px)] h-[clamp(120px,20vw,350px)] flex items-center justify-center absolute overflow-hidden transition-all duration-300 ease-in-out ${fade ? "opacity-100" : "opacity-0"}`}>
                                {featuredImage && (
                                    <Image
                                        src={featuredImage}
                                        alt={recette.title.rendered}
                                        fill
                                        sizes="(max-width: 768px) 120px, (max-width: 1024px) 20vw, 350px"
                                        className="object-cover transition-opacity duration-500"
                                    />
                                )}
                            </div>
                        </div>
                    </Link>
                    {/* </div> */}
                    <Image
                        src="/illu/couteau.svg"
                        alt="Illustration d'un couteau"
                        width={80}
                        height={0}
                        className="w-[clamp(40px,5vw,80px)] h-[clamp(140px,25vw,390px)]"
                    />
                </div>
                <button onClick={nextRecette} className='text-4xl lg:text-8xl ml-2 font-caveat'>{'>'}</button>
            </div>
            <h2 className={`text-xs md:text-lg lg:text-2xl font-quicksand font-semibold mt-6 lg:mt-12 transition-all duration-300 ease-in-out ${fade ? "opacity-100" : "opacity-0"}`}>{recette.title.rendered}</h2>
        </div>
    );
}