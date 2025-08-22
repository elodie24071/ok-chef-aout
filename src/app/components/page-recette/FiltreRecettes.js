'use client';
import { useState, useEffect } from "react";
import Image from "next/image";
import TagIllu from "../tags/TagIllu";
import TagIlluJaune from "../tags/TagIlluJaune";

export default function FiltreRecettes({ recettes, onFilteredRecettes }) {
  // États internes pour les filtres
  const [typePlat, setTypePlat] = useState('');
  const [typeAliment, setTypeAliment] = useState('');
  const [ouvert, setOuvert] = useState(null);

  // Configuration des options de filtrage
  const typePlatOptions = [
    { value: 'entree', label: 'Entrée' },
    { value: 'plat', label: 'Plat' },
    { value: 'dessert', label: 'Dessert' },
  ];

  const typeAlimentOptions = [
    { value: 'viande', label: 'Viande', icon: TagIlluJaune['viande'], iconHover: TagIllu['viande'] },
    { value: 'poisson', label: 'Poisson', icon: TagIlluJaune['poisson'], iconHover: TagIllu['poisson'] },
    { value: 'vegetarien', label: 'Végétarien', icon: TagIlluJaune['vegetarien'], iconHover: TagIllu['vegetarien'] },
  ];

  // Logique de filtrage
  useEffect(() => {
    let result = recettes;

    if (typePlat) {
      result = result.filter(r =>
        r._embedded['wp:term'].flat().some(tag => 
          tag.taxonomy === 'type_de_plat' && tag.slug === typePlat
        )
      );
    }

    if (typeAliment) {
      result = result.filter(r =>
        r._embedded['wp:term'].flat().some(tag => 
          tag.taxonomy === 'type_d_aliment' && tag.slug === typeAliment
        )
      );
    }

    // Renvoie les recettes filtrées au composant parent
    onFilteredRecettes(result);
  }, [typePlat, typeAliment, recettes, onFilteredRecettes]);

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setTypePlat('');
    setTypeAliment('');
    setOuvert(null);
  };

  // Fonction pour gérer l'ouverture des dropdowns
  const toggleDropdown = (type) => {
    setOuvert(ouvert === type ? null : type);
  };

  // Fonction pour sélectionner une option
  const selectOption = (type, value) => {
    if (type === 'plat') {
      setTypePlat(value);
    } else if (type === 'aliment') {
      setTypeAliment(value);
    }
    setOuvert(null);
  };

  return (
    <div className='filtres flex items-center justify-center mb-8'>
      <div className='flex items-center gap-2 bg-brun py-2 px-2 rounded-full'>
        {/* Filtre type de plat */}
        <FilterDropdown
          label="Quel type de plat ?"
          options={typePlatOptions}
          value={typePlat}
          isOpen={ouvert === 'plat'}
          onToggle={() => toggleDropdown('plat')}
          onSelect={(value) => selectOption('plat', value)}
        />

        {/* Filtre type d'aliment */}
        <FilterDropdown
          label="Quel type d'aliment ?"
          options={typeAlimentOptions}
          value={typeAliment}
          isOpen={ouvert === 'aliment'}
          onToggle={() => toggleDropdown('aliment')}
          onSelect={(value) => selectOption('aliment', value)}
        />

        {/* Bouton reset */}
        {(typePlat || typeAliment) && (
          <button
            onClick={resetFilters}
            className="px-3 py-2 bg-jaune text-brun border-2 border-transparent rounded-full hover:bg-jaune hover:border-jaune transition-colors text-sm"
          >
            ✕ Reset
          </button>
        )}
      </div>
    </div>
  );
}

// Composant interne pour les dropdowns individuels
function FilterDropdown({ label, options, value, isOpen, onToggle, onSelect }) {
  return (
    <div className="relative font-quicksand">
      <button
        onClick={onToggle}
        className='px-3 py-2 bg-brun text-jaune border-2 border-transparent rounded-full hover:bg-jaune hover:text-brun transition-colors'
      >
        {value ? options.find(o => o.value === value)?.label : label}
        <span className="ml-2">▾</span>
      </button>

      {isOpen && (
        <ul className="absolute mt-5 border rounded-3xl bg-brun text-jaune flex gap-2 w-fit p-3 z-10">
          {options.map(option => (
            <FilterOption
              key={option.value}
              option={option}
              onSelect={() => onSelect(option.value)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// Composant pour gérer l'état hover de chaque option
function FilterOption({ option, onSelect }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="px-4 py-2 border border-jaune rounded-full w-fit hover:bg-jaune hover:text-brun cursor-pointer flex justify-center items-center gap-2"
    >
      {option.icon && (
        <Image 
          src={isHovered && option.iconHover ? option.iconHover : option.icon} 
          alt={option.label} 
          width={20} 
          height={20} 
        />
      )}
      {option.label}
    </li>
  );
}