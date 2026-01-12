'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function LandingNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-2">
                <div className="relative h-12 w-36 md:h-16 md:w-48">
                    <Image
                        src="/batang-scba-logo.png"
                        alt="Batang SCBA Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-300 uppercase tracking-widest">
                <Link href="#" className="hover:text-primary transition-colors">About</Link>
                <Link href="#" className="hover:text-primary transition-colors">Camps</Link>
                <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
                className="md:hidden text-white p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
            >
                {isMenuOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                )}
            </button>

            {/* Mobile Navigation Overlay */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-background/95 backdrop-blur-md border-b border-white/10 p-6 flex flex-col items-center gap-6 md:hidden shadow-xl animate-in slide-in-from-top-2">
                    <Link
                        href="#"
                        className="text-lg font-bold text-white uppercase tracking-widest hover:text-primary transition-colors py-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        About
                    </Link>
                    <Link
                        href="#"
                        className="text-lg font-bold text-white uppercase tracking-widest hover:text-primary transition-colors py-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Camps
                    </Link>
                    <Link
                        href="#"
                        className="text-lg font-bold text-white uppercase tracking-widest hover:text-primary transition-colors py-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Contact
                    </Link>
                </div>
            )}
        </header>
    )
}
