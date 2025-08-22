// app/components/tags/TagStyle.js
import Image from "next/image";

export default function TagStyle({ nom, icone }) {
    return (
        <span className="flex items-center gap-2 px-4 py-1 border border-brun rounded-full text-brun text-xs md:text-sm font-quicksand">
            {icone && (
                <Image src={icone} alt={nom} width={25} height={25} className="inline-block" />
            )}
            {nom}
        </span>
    );
}