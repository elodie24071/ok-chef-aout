"use client";
import { useState } from "react";
import DropDown from "./DropDown"

export default function ListeIngredients({ ingredients }) {
    const [checkedIngredients, setCheckedIngredients] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    
    // checkbox
    const handleCheck = (index) => {
        setCheckedIngredients((prev) =>
            prev.includes(index) // vérifie si l'ingrédient est déjà coché
                ? prev.filter((i) => i !== index) // si oui, on le décoche
                : [...prev, index] // sinon, on l'ajoute
        );
    };

    return (
        <div>
            <DropDown 
                title="Ingrédients" 
                className="border-t border-brun pt-2"
                isOpen={isOpen}
                onToggle={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-col gap-2 mt-2 text-xs md:text-sm lg:text-base">
                    {ingredients.map((item, index) => (
                        <label key={index}>
                            <input
                                type="checkbox"
                                checked={checkedIngredients.includes(index)}
                                onChange={() => handleCheck(index)}
                                className="mr-2 accent-brun cursor-pointer rounded"
                            />
                            <span className={`cursor-pointer ${checkedIngredients.includes(index) ? "line-through opacity-50" : ""}`}>
                                {item.ingredient}
                            </span>
                        </label>
                    ))}
                </div>
            </DropDown>
        </div>
    );
}