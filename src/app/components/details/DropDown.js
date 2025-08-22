// app/components/details/DropDown.js
"use client";
import { useRef, useEffect, useState } from "react";

export default function DropDown({ title, children, isOpen, onToggle }) {
    const contentRef = useRef(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            const scrollHeight = contentRef.current.scrollHeight;
            setHeight(isOpen ? scrollHeight + 10 : 0);
        }
    }, [isOpen, children]);

    return (
        <div className="border-b border-brun py-6">
            <button
                onClick={onToggle}
                className="w-full h-auto text-left flex justify-between items-center font-bold uppercase text-sm md:text-base lg:text-lg"
            >
                {title}
                <span className='mr-2 font-caveat text-xl md:text-2xl lg:text-3xl transition-transform duration-200 ease-out'>
                    {isOpen ? "-" : "+"}
                </span>
            </button>
            
            <div
                className="overflow-hidden transition-all duration-300 ease-out"
                style={{ height: `${height}px` }}
            >
                <div ref={contentRef} className="mt-2">
                    {children}
                </div>
            </div>
        </div>
    );
}