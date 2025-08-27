import DropDown from "./DropDown"

export default function ListeEtapes({ etapes, etapeOuverte, setEtapeOuverte }) {
    return (
        <div>
            {etapes.map((item, index) => (
                <div key={index} data-etape-index={index}>
                    <DropDown
                        title={`Étape ${index + 1}`}
                        isOpen={etapeOuverte === index}
                        onToggle={() => setEtapeOuverte(etapeOuverte === index ? null : index)}
                    >
                        {item.etape}
                    </DropDown>
                </div>
            ))}
        </div>
    );
}