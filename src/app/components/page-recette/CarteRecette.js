import Link from 'next/link';
import Image from 'next/image';
import TagStyle from '../tags/TagStyle';
import TagIllu from '../tags/TagIllu';

export default function CarteRecette({ recette }) {
  const featuredImage = recette._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
  const tags = recette._embedded['wp:term']?.flat() || [];

  const typeDePlat = tags.filter(tag => tag.taxonomy === 'type_de_plat');
  const typeAliment = tags.filter(tag => tag.taxonomy === 'type_d_aliment');

  return (
    <div className='container flex flex-col items-center justify-center'>
      <Link href={`/recettes/${recette.slug}`} className="font-medium flex flex-col items-center p-10">
        {/* Image mise en avant */}
        <div className='relative flex'>
          <Image
            src="/illu/assiette.svg"
            alt="Illustration d'une assiette"
            width={550}
            height={550}
            className="w-[clamp(200px,30vw,550px)] h-auto transition-transform duration-500 hover:rotate-12"
            priority
          />
          <div className='rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130px] h-[130px] md:w-[20vw] md:h-[20vw] lg:w-[65%] lg:h-[65%] flex items-center justify-center absolute overflow-hidden'>
            {featuredImage && (
              <Image
                src={featuredImage}
                alt={recette.title.rendered}
                fill
                sizes="(max-width: 768px) 130px, (max-width: 1024px) 20vw, 65vw"
                className="object-cover"
              />
            )}
          </div>
        </div>
      </Link>
      <h2 className="text-sm md:text-lg lg:text-xl text-center font-semibold mb-2 md:mb-4 font-quicksand">{recette.title.rendered}</h2>
      <div className="flex flex-wrap gap-2">
        {typeDePlat.map(tag => (
          <TagStyle key={tag.id} nom={tag.name} />
        ))}
        {typeAliment.map(tag => (
          <TagStyle key={tag.id} nom={tag.name} icone={TagIllu[tag.slug]} />
        ))}
      </div>
    </div>

  );
}