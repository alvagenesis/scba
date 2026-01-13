'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types/database'
import Button from '@/components/ui/Button'

interface NavbarProps {
    profile: Profile | null
}

export default function Navbar({ profile }: NavbarProps) {
    const router = useRouter()
    const supabase = createClient()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (!profile) return null

    const isCoach = profile.role === 'coach'
    const baseRoute = isCoach ? '/coach' : '/student'

    const NavLinks = () => (
        <>
            <Link
                href={`${baseRoute}/dashboard`}
                className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs transition-colors py-2 md:py-0"
                onClick={() => setIsMenuOpen(false)}
            >
                Dashboard
            </Link>

            {isCoach ? (
                <>
                    <Link
                        href="/coach/camps"
                        className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs transition-colors py-2 md:py-0"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Camps
                    </Link>
                    <Link
                        href="/coach/players"
                        className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs transition-colors py-2 md:py-0"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Players
                    </Link>
                    <Link
                        href="/coach/games"
                        className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs transition-colors py-2 md:py-0"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Games
                    </Link>
                    <Link
                        href="/coach/training"
                        className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs transition-colors py-2 md:py-0"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Training
                    </Link>
                </>
            ) : (
                <>
                    <Link
                        href="/student/camps"
                        className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs transition-colors py-2 md:py-0"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Browse Camps
                    </Link>
                    <Link
                        href="/student/profile"
                        className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs transition-colors py-2 md:py-0"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Personal Details
                    </Link>
                </>
            )}
        </>
    )

    return (
        <nav className="bg-background border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center space-x-4 md:space-x-12">
                        <div className="relative h-12 w-36 md:h-16 md:w-48 shrink-0">
                            <Image
                                src="/batang-scba-logo.png"
                                alt="Batang SCBA Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        <div className="hidden md:flex space-x-8">
                            <NavLinks />
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-bold text-white uppercase tracking-wider">{profile.name}</p>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{profile.role}</p>
                        </div>
                        <div className="hidden md:block">
                            <Button variant="ghost" size="sm" onClick={handleLogout} className="border border-white/20 hover:border-red-500 hover:text-red-500 hover:bg-transparent">
                                Logout
                            </Button>
                        </div>

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
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-background/95 backdrop-blur-md border-b border-white/10 p-6 flex flex-col gap-6 md:hidden shadow-xl animate-in slide-in-from-top-2 z-50">
                    <div className="flex flex-col gap-4">
                        <NavLinks />
                    </div>
                    <div className="border-t border-white/10 pt-4 flex flex-col gap-4">
                        <div className="text-center">
                            <p className="text-sm font-bold text-white uppercase tracking-wider">{profile.name}</p>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{profile.role}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full border border-white/20 hover:border-red-500 hover:text-red-500 hover:bg-transparent justify-center">
                            Logout
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    )
}
