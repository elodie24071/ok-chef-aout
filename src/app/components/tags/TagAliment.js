// app/components/tags/TagAliment.js
import TagStyle from "./TagStyle";
import TagIllu from "./TagIllu";

export default function TagAliment({ tags }) {
    const aliments = ["Viande", "Poisson", "Végétarien"];
    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {tags .filter(tag => aliments.includes(tag)).map(tag => (
                <TagStyle key={tag} nom={tag} icone={TagIllu[tag]} />
            ))}
        </div>
    );
}