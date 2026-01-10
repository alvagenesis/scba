'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import type { Profile, EnrollmentWithDetails } from '@/lib/types/database'
import Navbar from '@/components/layout/Navbar'
import LoadingState from '@/components/ui/LoadingState'

export default function PlayersPage() {
    const [students, setStudents] = useState<Profile[]>([])
    const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([])
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
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

        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        setProfile(profileData)

        // Get all students
        const { data: studentsData } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'student')
            .order('name')

        if (studentsData) setStudents(studentsData)

        // Get all enrollments with camp details
        const { data: enrollmentsData } = await supabase
            .from('enrollments')
            .select('*, camps(*), profiles(*)')
            .order('enrolled_at', { ascending: false })

        if (enrollmentsData) setEnrollments(enrollmentsData)

        setLoading(false)
    }

    if (loading) {
        return <LoadingState message="Loading..." />
    }

    return (
        <div className="min-h-screen bg-background">
            {profile && <Navbar profile={profile} />}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white font-oswald uppercase tracking-wide">Players Management</h1>
                    <p className="text-gray-400 mt-1 uppercase tracking-widest text-xs">View all enrolled students and their camp assignments</p>
                </div>

                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-wider">All Students ({students.length})</h2>
                    </CardHeader>
                    <CardBody>
                        {students.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No students enrolled yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-4 font-bold text-gray-400 uppercase text-xs tracking-wider">Name</th>
                                            <th className="text-left py-3 px-4 font-bold text-gray-400 uppercase text-xs tracking-wider">Email</th>
                                            <th className="text-left py-3 px-4 font-bold text-gray-400 uppercase text-xs tracking-wider">Enrolled Camps</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student) => {
                                            const studentEnrollments = enrollments.filter(
                                                (e: any) => e.student_id === student.id
                                            )

                                            return (
                                                <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="py-4 px-4 font-bold text-white uppercase">{student.name}</td>
                                                    <td className="py-4 px-4 text-gray-400 text-sm tracking-wide">{student.id}</td>
                                                    <td className="py-4 px-4">
                                                        {studentEnrollments.length > 0 ? (
                                                            <div className="space-y-1">
                                                                {studentEnrollments.map((enrollment: any) => (
                                                                    <div key={enrollment.id} className="text-sm text-primary">
                                                                        • <span className="text-gray-300">{enrollment.camps?.name}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-600 text-xs uppercase tracking-widest">Not enrolled</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </main>
        </div>
    )
}
