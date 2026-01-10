'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugPage() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [msg, setMsg] = useState('')
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setProfile(profile)
                if (error) console.error(error)
            }
            setLoading(false)
        }
        checkUser()
    }, [])

    const fixProfile = async () => {
        if (!user) return

        // Try to derive role from metadata or default to coach for this specific case
        const role = user.user_metadata?.role || 'coach'
        const name = user.user_metadata?.name || 'Alva Genesis'

        const { error } = await supabase.from('profiles').insert({
            id: user.id,
            name,
            role
        })

        if (error) {
            setMsg('Error fixing profile: ' + error.message)
        } else {
            setMsg('Profile created! You can now login.')
            // Validating...
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            setProfile(data)
        }
    }

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Debug User State</h1>

            <div className="mb-6 p-4 border rounded bg-gray-50">
                <h2 className="font-bold">Auth User</h2>
                <pre className="text-sm overflow-auto mt-2">
                    {user ? JSON.stringify(user, null, 2) : 'No user logged in'}
                </pre>
            </div>

            <div className="mb-6 p-4 border rounded bg-gray-50">
                <h2 className="font-bold">Public Profile</h2>
                <pre className="text-sm overflow-auto mt-2">
                    {profile ? JSON.stringify(profile, null, 2) : 'No profile found'}
                </pre>
            </div>

            {user && !profile && (
                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded">
                    <p className="text-yellow-800 mb-2">⚠️ User exists but Profile is missing!</p>
                    <button
                        onClick={fixProfile}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Fix Missing Profile
                    </button>
                    {msg && <p className="mt-2 text-red-600">{msg}</p>}
                </div>
            )}

            <div className="mt-8">
                <a href="/auth" className="text-blue-600 underline">Back to Login</a>
            </div>
        </div>
    )
}
