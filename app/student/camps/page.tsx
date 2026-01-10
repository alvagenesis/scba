'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card, { CardBody, CardFooter, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import type { Camp, Profile } from '@/lib/types/database'
import Navbar from '@/components/layout/Navbar'
import LoadingState from '@/components/ui/LoadingState'

export default function CampsPage() {
    const [camps, setCamps] = useState<Camp[]>([])
    const [enrolledCampIds, setEnrolledCampIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [enrolling, setEnrolling] = useState<string | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/auth')
            return
        }

        // Get profile
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        setProfile(profileData)

        // Get all camps
        const { data: campsData } = await supabase
            .from('camps')
            .select('*')
            .order('start_date', { ascending: true })

        if (campsData) setCamps(campsData)

        // Get enrollments
        const { data: enrollmentsData } = await supabase
            .from('enrollments')
            .select('camp_id')
            .eq('student_id', user.id)

        if (enrollmentsData) {
            setEnrolledCampIds(new Set(enrollmentsData.map(e => e.camp_id)))
        }

        setLoading(false)
    }

    const handleEnroll = async (campId: string) => {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        setEnrolling(campId)

        const { error } = await supabase
            .from('enrollments')
            .insert({ student_id: user.id, camp_id: campId })

        if (!error) {
            setEnrolledCampIds(prev => new Set(prev).add(campId))
        }

        setEnrolling(null)
    }

    if (loading) {
        return <LoadingState message="Loading camps..." />
    }

    return (
        <div className="min-h-screen bg-background">
            {profile && <Navbar profile={profile} />}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white font-oswald uppercase tracking-wide">Available Camps</h1>
                    <p className="text-gray-400 mt-1 uppercase tracking-widest text-xs">Enroll in basketball camps to start your journey</p>
                </div>

                {camps.length === 0 ? (
                    <Card>
                        <CardBody className="text-center py-12 text-gray-500">
                            No camps available at the moment. Check back later!
                        </CardBody>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {camps.map((camp) => {
                            const isEnrolled = enrolledCampIds.has(camp.id)
                            const isEnrolling = enrolling === camp.id

                            return (
                                <Card key={camp.id} hover className="group">
                                    <CardHeader className="bg-white/5 border-b border-white/10">
                                        <h3 className="text-xl font-bold text-white font-oswald uppercase tracking-wider group-hover:text-primary transition-colors">{camp.name}</h3>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-gray-400 flex items-center gap-2">
                                                    <span className="text-primary">📍</span> {camp.location}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400 flex items-center gap-2">
                                                    <span className="text-primary">📅</span> {new Date(camp.start_date).toLocaleDateString()} - {new Date(camp.end_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-white">₱{camp.price}</p>
                                            </div>
                                            {camp.description && (
                                                <div>
                                                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">{camp.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardBody>
                                    <CardFooter className="border-t border-white/5 bg-white/5">
                                        {isEnrolled ? (
                                            <div className="w-full text-center py-3 bg-primary/10 text-primary font-bold uppercase tracking-wider border border-primary/20">
                                                ✓ Enrolled
                                            </div>
                                        ) : (
                                            <Button
                                                className="w-full"
                                                onClick={() => handleEnroll(camp.id)}
                                                disabled={isEnrolling}
                                            >
                                                {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}
