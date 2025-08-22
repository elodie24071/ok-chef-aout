// app/components/details/ListeEtapes.js
import DropDown from "./DropDown"

export default function ListeEtapes({ etapes, etapeOuverte, setEtapeOuverte }) {
    return (
        <div>
            {etapes.map((item, index) => (
                <DropDown 
                    key={index} 
                    title={`Étape ${index + 1}`}
                    isOpen={etapeOuverte === index}
                    onToggle={() => setEtapeOuverte(etapeOuverte === index ? null : index)}
                >
                    <p className="text-xs md:text-sm lg:text-base">{item.etape}</p>
                </DropDown>
            ))}
        </div>
    )
}