'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { calculateAverageStats } from '@/lib/utils/stats'
import type { Profile, GameStat } from '@/lib/types/database'
import LoadingState from '@/components/ui/LoadingState'

export default function PlayerDetailPage() {
    const params = useParams()
    const studentId = params.id as string
    const router = useRouter()
    const supabase = createClient()

    const [profile, setProfile] = useState<Profile | null>(null)
    const [student, setStudent] = useState<Profile | null>(null)
    const [enrollments, setEnrollments] = useState<any[]>([])
    const [gameStats, setGameStats] = useState<GameStat[]>([])
    const [evaluations, setEvaluations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [studentId])

    const loadData = async () => {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/auth')
            return
        }

        // Get coach profile
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        setProfile(profileData)

        // Get student profile
        const { data: studentData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', studentId)
            .single()

        if (!studentData) {
            router.push('/coach/players')
            return
        }
        setStudent(studentData)

        // Get enrollments
        const { data: enrollmentsData } = await supabase
            .from('enrollments')
            .select('*, camps(*)')
            .eq('student_id', studentId)

        if (enrollmentsData) setEnrollments(enrollmentsData)

        // Get all game stats for the student
        const { data: statsData } = await supabase
            .from('game_stats')
            .select('*, games(*)')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })

        if (statsData) setGameStats(statsData)

        // Get all evaluations for the student
        const { data: evaluationsData } = await supabase
            .from('evaluations')
            .select('*, training_sessions(*)')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })

        if (evaluationsData) setEvaluations(evaluationsData)

        setLoading(false)
    }

    if (loading) return <LoadingState message="Loading..." />
    if (!student) return null

    const avgStats = calculateAverageStats(gameStats || [])

    return (
        <div className="min-h-screen bg-background">
            {profile && <Navbar profile={profile} />}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <a href="/coach/players" className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs mb-4 inline-flex items-center gap-2 transition-colors">
                        ← Back to Players
                    </a>
                    <h1 className="text-4xl font-bold text-white font-oswald uppercase tracking-wide">{student.name}</h1>
                    <p className="text-gray-400 mt-2 uppercase tracking-widest text-xs">{student.email}</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    <Card className="hover:border-primary/50 transition-all duration-300">
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-white">{avgStats.points}</div>
                            <div className="text-gray-400 text-[10px] uppercase tracking-widest mt-1">Avg Points</div>
                        </CardBody>
                    </Card>
                    <Card className="hover:border-primary/50 transition-all duration-300">
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-white">{avgStats.rebounds}</div>
                            <div className="text-gray-400 text-[10px] uppercase tracking-widest mt-1">Avg Rebounds</div>
                        </CardBody>
                    </Card>
                    <Card className="hover:border-primary/50 transition-all duration-300">
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-white">{avgStats.assists}</div>
                            <div className="text-gray-400 text-[10px] uppercase tracking-widest mt-1">Avg Assists</div>
                        </CardBody>
                    </Card>
                    <Card className="hover:border-primary/50 transition-all duration-300">
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-white">{avgStats.steals}</div>
                            <div className="text-gray-400 text-[10px] uppercase tracking-widest mt-1">Avg Steals</div>
                        </CardBody>
                    </Card>
                    <Card className="hover:border-primary/50 transition-all duration-300">
                        <CardBody className="text-center">
                            <div className="text-3xl font-bold text-white">{avgStats.blocks}</div>
                            <div className="text-gray-400 text-[10px] uppercase tracking-widest mt-1">Avg Blocks</div>
                        </CardBody>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Enrolled Camps */}
                    <div>
                        <Card className="h-full">
                            <CardHeader>
                                <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-wider">Enrolled Camps</h2>
                            </CardHeader>
                            <CardBody>
                                {enrollments && enrollments.length > 0 ? (
                                    <div className="space-y-3">
                                        {enrollments.map((enrollment: any) => (
                                            <div key={enrollment.id} className="p-4 bg-white/5 rounded-none border border-white/10 hover:border-primary/30 transition-colors">
                                                <h3 className="font-bold text-white uppercase tracking-wide">{enrollment.camps.name}</h3>
                                                <p className="text-sm text-gray-400 mt-1">{enrollment.camps.location}</p>
                                                <p className="text-xs text-primary font-bold mt-2 uppercase tracking-wider">
                                                    {new Date(enrollment.camps.start_date).toLocaleDateString()} - {new Date(enrollment.camps.end_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <p>No camps enrolled.</p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>

                    {/* Evaluations */}
                    <div>
                        <Card className="h-full">
                            <CardHeader>
                                <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-wider">Coach Evaluations</h2>
                            </CardHeader>
                            <CardBody>
                                {evaluations && evaluations.length > 0 ? (
                                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {evaluations.map((evaluation: any) => (
                                            <div key={evaluation.id} className="p-4 bg-white/5 rounded-none border border-white/10 hover:border-primary/30 transition-colors">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <p className="text-sm font-bold text-white uppercase tracking-wide">
                                                            {evaluation.training_sessions?.drill_topic || 'Training Session'}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                                                            {evaluation.training_sessions?.session_date ? new Date(evaluation.training_sessions.session_date).toLocaleDateString() : 'Date N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center bg-primary/20 px-3 py-1 rounded-none border border-primary/30">
                                                        <span className="text-primary font-bold text-sm">{evaluation.rating}/10</span>
                                                    </div>
                                                </div>
                                                {evaluation.strengths && (
                                                    <div className="mt-3">
                                                        <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Strengths</p>
                                                        <p className="text-sm text-gray-300 mt-1">{evaluation.strengths}</p>
                                                    </div>
                                                )}
                                                {evaluation.weaknesses && (
                                                    <div className="mt-3">
                                                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Areas to Improve</p>
                                                        <p className="text-sm text-gray-300 mt-1">{evaluation.weaknesses}</p>
                                                    </div>
                                                )}
                                                {evaluation.coach_notes && (
                                                    <div className="mt-3 border-t border-white/5 pt-3">
                                                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Coach Notes</p>
                                                        <p className="text-sm text-gray-400 italic mt-1">"{evaluation.coach_notes}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        No evaluations found.
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </div>

                {/* Game Stats Details */}
                {gameStats && gameStats.length > 0 && (
                    <Card className="mt-8 border-primary/30">
                        <CardHeader className="bg-primary/5">
                            <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-wider">Performance Log</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-4 font-bold text-gray-400 uppercase text-xs tracking-wider">Date</th>
                                            <th className="text-left py-3 px-4 font-bold text-gray-400 uppercase text-xs tracking-wider">Teams</th>
                                            <th className="text-left py-3 px-4 font-bold text-gray-400 uppercase text-xs tracking-wider">PTS</th>
                                            <th className="text-left py-3 px-4 font-bold text-gray-400 uppercase text-xs tracking-wider">REB</th>
                                            <th className="text-left py-3 px-4 font-bold text-gray-400 uppercase text-xs tracking-wider">AST</th>
                                            <th className="text-left py-3 px-4 font-bold text-gray-400 uppercase text-xs tracking-wider">STL</th>
                                            <th className="text-left py-3 px-4 font-bold text-gray-400 uppercase text-xs tracking-wider">BLK</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gameStats.map((stat: any) => (
                                            <tr key={stat.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4 text-sm text-gray-300">{new Date(stat.games.game_date).toLocaleDateString()}</td>
                                                <td className="py-3 px-4 text-sm text-white">{stat.games.team_1_name} vs {stat.games.team_2_name}</td>
                                                <td className="py-3 px-4 text-sm font-bold text-primary">{stat.points}</td>
                                                <td className="py-3 px-4 text-sm text-gray-300">{stat.rebounds}</td>
                                                <td className="py-3 px-4 text-sm text-gray-300">{stat.assists}</td>
                                                <td className="py-3 px-4 text-sm text-gray-300">{stat.steals}</td>
                                                <td className="py-3 px-4 text-sm text-gray-300">{stat.blocks}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardBody>
                    </Card>
                )}
            </main>
        </div>
    )
}
