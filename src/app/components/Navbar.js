import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-brun text-jaune p-4 flex justify-between items-center font-quicksand z-50">
      <Link href="../" className="font-bold text-base md:text-xl lg:text-2xl font-caveat">
        <Image
          src="/illu/logo-jaune.svg"
          alt="Logo Ok Chef"
          width={200}
          height={200}
          className="inline-block mr-2 w-[clamp(120px,10vw,200px)] h-auto"
        />
      </Link>
      <div className="space-x-4">
        <Link href="/recettes" className="font-caveat text-xs md:text-sm lg:text-lg mt-6 px-3 lg:px-6 py-1 bg-jaune text-brun border-2 border-transparent rounded-full shadow hover:bg-transparent hover:border-jaune hover:text-jaune transition-colors">Recettes</Link>
      </div>
    </nav>
  );
}