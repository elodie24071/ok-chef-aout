// app/layout.js
// export const metadata = {
//   title: 'Ok Chef',
//   description: 'Carnet de recettes connecté à WordPress',
// };

import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParallaxProviderClient from './parallaxe/ParallaxeProviderClient';
import { Quicksand, Caveat_Brush } from 'next/font/google';

const quicksand = Quicksand({ subsets: ['latin'], weight: ['300','400','500','600','700'] });
const caveat = Caveat_Brush({ subsets: ['latin'], weight: ['400'] });


export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${quicksand.className} ${caveat.className} bg-jaune text-brun min-h-screen flex flex-col`}>
      <ParallaxProviderClient>
        <Navbar />
        <main className="contenu-app-page">{children}</main>
        <Footer />
      </ParallaxProviderClient>
      </body>
    </html>
  );
}