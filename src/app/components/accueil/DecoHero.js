// app/components/accueil/DecoHero.js
'use client';
import Image from "next/image";
import { Parallax } from "react-scroll-parallax";

export default function DecoHero() {
    return (
        <div className="illu relative">
            <div className="absolute bottom-0 left-0 w-[30vw] xl:w-[25vw]">
                <Parallax speed={-4}>
                    <Image
                        src="/illu/feuille.svg"
                        alt="Illustration d'une feuille"
                        width={500}
                        height={770}
                        draggable="false"
                        priority
                    />
                </Parallax>
            </div>
            <div className="absolute  bottom-[-50px] right-0 w-[30vw] xl:w-[25vw]">
                <Parallax speed={-2}>
                    <Image
                        src="/illu/basilic.svg"
                        alt="Illustration d'une feuille de basilic"
                        width={500}
                        height={740}
                        draggable="false"
                        priority
                    />
                </Parallax>
            </div>
        </div>
    );
}