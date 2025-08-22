// app/components/Hero.js
'use client';
import Image from "next/image";
import Link from "next/link";
import { Parallax } from "react-scroll-parallax";

export default function Hero() {
    return (
        <div className="hero flex flex-col relative overflow-x-hidden">
            <div className="absolute rotate-180 top-[clamp(-10px,-1vw,-5px)] left-[clamp(-10px,-1vw,-3px)]">
                <Parallax speed={-5}>
                    <Image
                        src="/illu/pt-oignon.png"
                        alt=""
                        aria-hidden
                        width={400}
                        height={300}
                        className="w-[clamp(150px,20vw,400px)] h-auto"
                        draggable="false"
                        priority
                    />
                </Parallax>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Parallax speed={10}>
                    <Image
                        src="/illu/gd-oignon.png"
                        alt=""
                        aria-hidden
                        width={700}
                        height={800}
                        className="w-[clamp(250px,40vw,700px)] h-auto"
                        draggable="false"
                        priority
                    />
                </Parallax>
            </div>
            <div className="absolute top-[-150px] right-[-20px]">
                <Parallax speed={-10}>
                    <Image
                        src="/illu/vanille.png"
                        alt="Illustration d'une gousse de vanille"
                        width={550}
                        height={660}
                        className="w-[clamp(200px,30vw,550px)] h-auto"
                    />
                </Parallax>
            </div>
            {/* <div className="absolute bottom-[clamp(0px,0vw,0px)] left-[clamp(0px,0vw,0px)]">
                <Parallax speed={-8}>
                    <Image
                        src="/illu/feuille.svg"
                        alt="Illustration d'une feuille"
                        width={500}
                        height={770}
                        className="w-[clamp(100px,30vw,500px)] h-auto"
                        draggable="false"
                        priority
                    />
                </Parallax>
            </div>
            <div className="absolute  bottom-[clamp(-50px,-16vw,-40px)] right-[clamp(0px,0vw,0px)]">
                <Parallax speed={-6}>
                    <Image
                        src="/illu/basilic.svg"
                        alt="Illustration d'une feuille de basilic"
                        width={500}
                        height={740}
                        className="w-[clamp(150px,30vw,450px)] h-auto"
                        draggable="false"
                        priority
                    />
                </Parallax>
            </div> */}

            <div className="flex flex-col justify-center items-center text-center min-h-[70vh] md:min-h-[80vh] lg:h-screen mx-auto z-10 px-5">
                <h1 className="text:xl md:text-2xl lg:text-4xl font-bold text-primary mb-4 font-caveat">
                    Bienvenue sur Ok Chef 🍳
                </h1>
                <p className="text-xs md:text-sm lg:text-lg max-w-xs lg:max-w-xl mx-auto font-quicksand font-semibold">
                    Ok chef te guide pas à pas dans tes recettes préférées. Cuisine en toute
                    simplicité, sans avoir à toucher ton écran !
                </p>
                <Link
                    href="/recettes"
                    className="mt-6 text-xs md:text-sm lg:text-lg px-2 md:px-6 lg:px-8 py-1 md:py-2 bg-jaune text-brun border-2 border-transparent rounded-full shadow hover:bg-transparent hover:border-jaune hover:text-jaune transition-colors"
                >
                    Découvrir les recettes
                </Link>
            </div>
        </div>

    )
}
