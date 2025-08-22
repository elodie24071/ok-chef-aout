'use client';
import Image from "next/image";
import { Parallax } from "react-scroll-parallax";

export default function DecoHero() {
    return (
        <div className="illu relative">
            <div className="absolute bottom-[clamp(0px,0vw,0px)] left-[clamp(0px,0vw,0px)]">
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
                <Parallax speed={-10}>
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
            </div>
        </div>
    );
}