'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [role, setRole] = useState<'student' | 'coach'>('student')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            if (isLogin) {
                // Login
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

                if (error) throw error

                // Get user profile to determine role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single()

                // Redirect based on role
                if (profile?.role === 'coach') {
                    router.push('/coach/dashboard')
                } else {
                    router.push('/student/dashboard')
                }
            } else {
                // Sign up
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name,
                            role,
                        },
                    },
                })

                if (error) throw error

                // Check if email confirmation is required
                if (data.user && !data.session) {
                    setMessage('Account created successfully! Please check your email to verify your account before logging in.')
                    return
                }

                // Redirect based on role
                if (role === 'coach') {
                    router.push('/coach/dashboard')
                } else {
                    router.push('/student/dashboard')
                }
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="relative h-24 w-64 mb-4">
                        <Image
                            src="/batang-scba-logo.png"
                            alt="Batang SCBA Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <p className="text-gray-400 text-sm tracking-widest uppercase">Bawal Mahina Mentality</p>
                </div>

                <div className="bg-card border border-white/10 p-8 rounded-none shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

                    <h2 className="text-2xl font-bold text-center text-white mb-8 font-oswald uppercase tracking-wider">
                        {isLogin ? 'Welcome Back' : 'Join The Team'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                                        placeholder="JOHN DOE"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">I am a:</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className={`cursor-pointer border p-3 flex items-center justify-center transition-all duration-200 ${role === 'student' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 text-gray-500 hover:border-gray-500'}`}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value="student"
                                                checked={role === 'student'}
                                                onChange={() => setRole('student')}
                                                className="hidden"
                                            />
                                            <span className="uppercase font-bold text-sm">Student</span>
                                        </label>
                                        <label className={`cursor-pointer border p-3 flex items-center justify-center transition-all duration-200 ${role === 'coach' ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 text-gray-500 hover:border-gray-500'}`}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value="coach"
                                                checked={role === 'coach'}
                                                onChange={() => setRole('coach')}
                                                className="hidden"
                                            />
                                            <span className="uppercase font-bold text-sm">Coach</span>
                                        </label>
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                            <input
                                type="email"
                                className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                                placeholder="YOU@EXAMPLE.COM"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                            <input
                                type="password"
                                className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-900/20 border border-red-900/50 text-red-500 px-4 py-3 text-sm">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="bg-green-900/20 border border-green-900/50 text-green-500 px-4 py-3 text-sm">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-black font-bold uppercase tracking-widest py-4 hover:bg-yellow-400 transition-colors shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                        >
                            {loading ? 'Processing...' : isLogin ? 'Login Access' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin)
                                setError(null)
                            }}
                            className="text-gray-500 hover:text-primary text-sm uppercase tracking-wider transition-colors"
                        >
                            {isLogin ? "Join The Program" : 'Already A Member? Login'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
