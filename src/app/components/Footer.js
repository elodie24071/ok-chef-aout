export default function Footer() {
  return (
    <footer className="bg-brun text-jaune text-center text-xs md:text-lg py-4 mt-12 font-quicksand">
      <p>© {new Date().getFullYear()} Ok Chef - Votre carnet digital de recettes</p>
    </footer>
  );
}