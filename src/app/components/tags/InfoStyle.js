// ACF temps et pers
import Image from "next/image";

export default function InfoStyle({ icone, valeur, suffix }) {
    return (
        <div className="flex items-center gap-2 px-4 py-1 border border-brun rounded-full text-brun text-xs md:text-sm font-quicksand w-fit">
            <Image src={icone} alt="" width={20} height={20} className="inline-block h-auto w-auto" />
            <span>{valeur} {suffix}</span>
        </div>
    );
}