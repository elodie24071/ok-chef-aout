'use client';
import { useState, useEffect } from "react";
import Image from "next/image";
import TagIllu from "../tags/TagIllu";
import TagIlluJaune from "../tags/TagIlluJaune";

export default function FiltreRecettes({ recettes, onFilteredRecettes }) {
  const [typePlat, setTypePlat] = useState('');
  const [typeAliment, setTypeAliment] = useState('');
  const [ouvert, setOuvert] = useState(null);
  const [isMobileOuvert, setIsMobileOuvert] = useState(false);

  // options pour filtre 'type de plat'
  const typePlatOptions = [
    { value: 'entree', label: 'Entrée' },
    { value: 'plat', label: 'Plat' },
    { value: 'dessert', label: 'Dessert' },
  ];

  // options pour filtre 'type d'aliment' + icones
  const typeAlimentOptions = [
    { value: 'viande', label: 'Viande', icon: TagIlluJaune['viande'], iconHover: TagIllu['viande'] },
    { value: 'poisson', label: 'Poisson', icon: TagIlluJaune['poisson'], iconHover: TagIllu['poisson'] },
    { value: 'vegetarien', label: 'Végétarien', icon: TagIlluJaune['vegetarien'], iconHover: TagIllu['vegetarien'] },
  ];

  // appliquer les filtres quand les états changent
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

    // envoyer les recettes filtrées au parent
    onFilteredRecettes(result);
  }, [typePlat, typeAliment, recettes, onFilteredRecettes]);

  // réinitialiser les filtres
  const resetFilters = () => {
    setTypePlat('');
    setTypeAliment('');
    setOuvert(null);
  };

  // gérer l'ouverture des dropdowns
  const toggleDropdown = (type) => {
    setOuvert(ouvert === type ? null : type);
  };

  // sélectionner une option
  const selectOption = (type, value) => {
    if (type === 'plat') {
      setTypePlat(value);
    } else if (type === 'aliment') {
      setTypeAliment(value);
    }
    setOuvert(null);
  };

  return (
    <>
      {/* bouton filtre mobile */}
      <div className="md:hidden flex justify-center mb-4">
        <button
          onClick={() => setIsMobileOuvert(true)}
          className="px-4 py-2 bg-brun text-jaune font-quicksand text-xs rounded-full"
        >
          Filtres
        </button>
      </div>

      <div className='hidden md:flex items-center justify-center mb-8 text-xs md:text-base'>
        <div className='flex items-center gap-2 bg-brun py-1 px-1 md:py-2 md:px-2 rounded-full'>
          {/* filtre type de plat */}
          <FilterDropdown
            label="Quel type de plat ?"
            options={typePlatOptions}
            value={typePlat}
            isOpen={ouvert === 'plat'}
            onToggle={() => toggleDropdown('plat')}
            onSelect={(value) => selectOption('plat', value)}
          />

          {/* filtre type d'aliment */}
          <FilterDropdown
            label="Quel type d'aliment ?"
            options={typeAlimentOptions}
            value={typeAliment}
            isOpen={ouvert === 'aliment'}
            onToggle={() => toggleDropdown('aliment')}
            onSelect={(value) => selectOption('aliment', value)}
          />

          {/* bouton reset */}
          {(typePlat || typeAliment) && (
            <button
              onClick={resetFilters}
              className="px-1 py-1 md:px-3 md:py-2 bg-jaune text-brun border-2 border-transparent rounded-full hover:bg-jaune hover:border-jaune transition-colors"
            >
              ✕ Reset
            </button>
          )}
        </div>
      </div>

      {/* popup */}
      {isMobileOuvert && (
        <div className="fixed inset-0 bg-brun text-jaune flex flex-col z-50 p-6 font-quicksand">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold mb-4">Filtres</h2>
            <button onClick={() => setIsMobileOuvert(false)}>✕</button>
          </div>

          {/* type de plat */}
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-2">Type de plat</h3>
            <div className="flex flex-wrap gap-2 text-sm">
              {typePlatOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => selectOption('plat', option.value)}
                  className={`px-2 py-1 rounded-full border border-jaune
              ${typePlat === option.value
                      ? 'bg-jaune text-brun'
                      : 'hover:bg-jaune hover:text-brun border-jaune'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* type d’aliment */}
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-2">Type d’aliment</h3>
            <div className="flex flex-wrap gap-2 text-sm">
              {typeAlimentOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => selectOption('aliment', option.value)}
                  className={`flex items-center gap-2 px-2 py-1 rounded-full border border-jaune
                    ${typeAliment === option.value
                      ? 'bg-jaune text-brun'
                      : 'hover:bg-jaune hover:text-brun border-jaune'
                    }`}
                >
                  <Image
                    src={typeAliment === option.value ? option.iconHover : option.icon}
                    alt={option.label}
                    width={20}
                    height={20}
                  />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* boutons en bas */}
          <div className="mt-auto flex flex-col gap-2">
            {(typePlat || typeAliment) && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-jaune text-brun rounded-full w-full text-xs"
              >
                ✕ Reset
              </button>
            )}

            <button
              onClick={() => setIsMobileOuvert(false)}
              className="px-4 py-2 bg-jaune text-brun font-quicksand text-xs rounded-full w-full font-bold"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// dropdowns individuels (desktop)
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
        <ul className="absolute mt-5 rounded-3xl bg-brun text-jaune flex gap-2 w-fit p-3 z-10">
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

// gérer l'état hover de chaque option
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