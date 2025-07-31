export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-yellow-100 text-gray-800">
      <h1 className="text-4xl font-bold text-orange-600">Bienvenue sur Ok Chef ! 👨‍🍳</h1>
      <p className="mt-4 text-lg">Votre carnet de recettes digital arrive bientôt 🍲</p>
      <button className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600">
        Découvrir les recettes
      </button>
    </main>
  );
}