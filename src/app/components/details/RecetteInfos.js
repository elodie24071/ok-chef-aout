// app/components/details/RecetteInfos.js
import InfoStyle from "../tags/InfoStyle"; // style pers, temps
import TagIllu from "../tags/TagIllu"; // illu des tags
import TagStyle from "../tags/TagStyle"; // style viande, poisson, végétarien

export default function RecetteInfos({ acf, taxonomies }) {
    const getTags = (taxNom) => taxonomies?.find(group => group[0]?.taxonomy === taxNom) || [];

    const typeDePlat = getTags('type_de_plat');
    const typeAliment = getTags('type_d_aliment');
    const difficulte = getTags('difficulte');


    return (
        <div className="flex flex-wrap gap-3 mb-4 font-quicksand text-lg">
            {typeDePlat.map((tag) => (
                <TagStyle key={tag.id} nom={tag.name} />
            ))}
            {typeAliment.map((tag) => (
                <TagStyle key={tag.id} nom={tag.name} icone={TagIllu[tag.slug]} />
            ))}

            {acf.temps_de_preparation && (
                <InfoStyle icone={TagIllu["temps"]} valeur={acf.temps_de_preparation} suffix="min."/>
            )}

            {acf.nbr_pers && (
                <InfoStyle icone={TagIllu["personnes"]} valeur={acf.nbr_pers} suffix="pers." />
            )}

            {difficulte.map((tag) => (
                <TagStyle key={tag.id} nom={tag.name} icone={TagIllu["difficulte"]} />
            ))}

        </div>
    )
}