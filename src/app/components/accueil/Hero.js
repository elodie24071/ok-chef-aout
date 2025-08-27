// app/components/accueil/Hero.js
'use client';
import Image from "next/image";
import Link from "next/link";
import { Parallax } from "react-scroll-parallax";

export default function Hero() {
    return (
        <div className="relative flex flex-col justify-center items-center text-center h-[70vh] md:h-[60vh] lg:max-h-screen xl:h-screen mx-auto z-10 px-5">
            <div className="absolute rotate-180 top-1 left-1 lg:-left-10 xl:-left-20 w-[40vw] md:w-[30vw] lg:w-[30vw] xl:w-[30vw] h-auto">
                <Parallax speed={-5}>
                    <Image
                        src="/illu/pt-oignon.svg"
                        alt=""
                        aria-hidden
                        width={400}
                        height={300}
                        draggable="false"
                        priority
                    />
                </Parallax>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] md:w-[60vw] xl:w-[45vw] h-auto">
                <Parallax speed={10}>
                    <Image
                        src="/illu/gd-oignon.svg"
                        alt=""
                        aria-hidden
                        width={700}
                        height={800}
                        className="w-full h-full object-center"
                        draggable="false"
                        priority
                    />
                </Parallax>
            </div>
            <div className="absolute top-[-120px] right-[-40px] w-[50vw] md:w-[35vw] xl:w-[30vw] h-auto">
                <Parallax speed={-10}>
                    <Image
                        src="/illu/vanille.svg"
                        alt="Illustration d'une gousse de vanille"
                        width={550}
                        height={660}
                        draggable="false"
                        priority
                    />
                </Parallax>
            </div>
            
            <div className="flex flex-col justify-center items-center text-center min-h-[70vh] md:min-h-[80vh] lg:h-screen mx-auto z-10 px-5">
                <h1 className="text:xl md:text-2xl lg:text-4xl font-bold mb-4 font-caveat">
                    Bienvenue sur Ok Chef
                </h1>
                <p className="text-xs md:text-sm lg:text-lg max-w-xs lg:max-w-xl mx-auto font-quicksand font-semibold">
                    Ok chef te guide pas à pas dans tes recettes préférées. Cuisine en toute
                    simplicité, sans avoir à toucher ton écran !
                </p>
                <Link
                    href="/recettes"
                    className="font-quicksand font-semibold mt-6 text-xs md:text-sm lg:text-lg px-2 md:px-6 lg:px-8 py-1 md:py-2 bg-jaune text-brun border-2 border-transparent rounded-full shadow hover:bg-transparent hover:border-jaune hover:text-jaune transition-colors"
                >
                    Découvrir les recettes
                </Link>
            </div>
        </div>

    )
}