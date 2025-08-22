'use client';

import { ParallaxProvider } from "react-scroll-parallax";

export default function ParallaxProviderClient({ children }) {
    return (<ParallaxProvider>{children}</ParallaxProvider>);
}
