import Image from "next/image";

export default function RecetteImage({ recette, featuredImage }) {
  return (
    <div className="relative flex items-center justify-center lg:h-[65vh] mb-4">
      <div className='relative flex'>
        <Image
          src="/illu/assiette.svg"
          alt="Illustration d'une assiette"
          width={550}
          height={550}
          className="w-[clamp(200px,30vw,550px)] h-auto"
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
    </div>
  );
}