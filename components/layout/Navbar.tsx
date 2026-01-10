'use client'

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

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (!profile) return null

    const isCoach = profile.role === 'coach'
    const baseRoute = isCoach ? '/coach' : '/student'

    return (
        <nav className="bg-background border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center space-x-12">
                        <div className="relative h-16 w-48">
                            <Image
                                src="/batang-scba-logo.png"
                                alt="Batang SCBA Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        <div className="hidden md:flex space-x-8">
                            <Link
                                href={`${baseRoute}/dashboard`}
                                className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs transition-colors"
                            >
                                Dashboard
                            </Link>

                            {isCoach ? (
                                <>
                                    <Link
                                        href="/coach/camps"
                                        className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs transition-colors"
                                    >
                                        Camps
                                    </Link>
                                    <Link
                                        href="/coach/players"
                                        className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs transition-colors"
                                    >
                                        Players
                                    </Link>
                                    <Link
                                        href="/coach/games"
                                        className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs transition-colors"
                                    >
                                        Games
                                    </Link>
                                    <Link
                                        href="/coach/training"
                                        className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs transition-colors"
                                    >
                                        Training
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href="/student/camps"
                                    className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs transition-colors"
                                >
                                    Browse Camps
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="text-right">
                            <p className="text-sm font-bold text-white uppercase tracking-wider">{profile.name}</p>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{profile.role}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="border border-white/20 hover:border-red-500 hover:text-red-500 hover:bg-transparent">
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
