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
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

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
    const [attendanceStats, setAttendanceStats] = useState({ gamesAttended: 0, totalGames: 0, trainingAttended: 0, totalTraining: 0 })
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

        // Get attendance stats
        if (enrollmentsData && enrollmentsData.length > 0) {
            const campIds = enrollmentsData.map((e: any) => e.camp_id)

            // Get total games
            const { count: totalGames } = await supabase
                .from('games')
                .select('*', { count: 'exact', head: true })
                .in('camp_id', campIds)

            // Get total training
            const { count: totalTraining } = await supabase
                .from('training_sessions')
                .select('*', { count: 'exact', head: true })
                .in('camp_id', campIds)

            // Get attendance records
            const { data: attendance } = await supabase
                .from('attendance')
                .select('*')
                .eq('student_id', studentId)

            const gamesAttended = attendance?.filter(a => a.game_id && a.status === 'present').length || 0
            const trainingAttended = attendance?.filter(a => a.training_session_id && a.status === 'present').length || 0

            setAttendanceStats({
                gamesAttended,
                totalGames: totalGames || 0,
                trainingAttended,
                totalTraining: totalTraining || 0
            })
        }

        setLoading(false)
    }

    const handleDownloadPDF = async () => {
        const input = document.getElementById('report-card-print')
        if (!input) return

        try {
            const dataUrl = await toPng(input, {
                quality: 0.95,
                pixelRatio: 2,
                backgroundColor: '#ffffff' // Ensure white background
            })

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const imgProps = pdf.getImageProperties(dataUrl)
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(`${student?.name.replace(/\s+/g, '_')}_Report.pdf`)
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Failed to generate PDF. Please try again.')
        }
    }

    if (loading) return <LoadingState message="Loading..." />
    if (!student) return null

    const avgStats = calculateAverageStats(gameStats || [])

    return (
        <div className="min-h-screen bg-background relative">
            {profile && <Navbar profile={profile} />}

            <main id="player-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <a href="/coach/players" className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs mb-4 inline-flex items-center gap-2 transition-colors">
                            ← Back to Players
                        </a>
                        <h1 className="text-4xl font-bold text-white font-oswald uppercase tracking-wide">{student.name}</h1>
                        <p className="text-gray-400 mt-2 uppercase tracking-widest text-xs">{student.email}</p>
                    </div>
                    <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
                        <span>📄</span> Download PDF
                    </Button>
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

                {/* Attendance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <Card className="border-primary/30">
                        <CardBody className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white font-oswald uppercase">Games Attendance</h3>
                                <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">Oraganized Games</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-primary">{attendanceStats.gamesAttended}</span>
                                <span className="text-gray-500 text-xl font-bold mx-1">/</span>
                                <span className="text-xl font-bold text-gray-400">{attendanceStats.totalGames}</span>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="border-primary/30">
                        <CardBody className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white font-oswald uppercase">Training Attendance</h3>
                                <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">Sessions Attended</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-primary">{attendanceStats.trainingAttended}</span>
                                <span className="text-gray-500 text-xl font-bold mx-1">/</span>
                                <span className="text-xl font-bold text-gray-400">{attendanceStats.totalTraining}</span>
                            </div>
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

            {/* Hidden Report Card for PDF Generation */}
            <div style={{ height: 0, overflow: 'hidden' }}>
                <div id="report-card-print" className="w-[210mm] min-h-[297mm] bg-white text-black p-12">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
                        <div>
                            <h1 className="text-4xl font-bold font-oswald uppercase tracking-wide">Batang SCBA</h1>
                            <p className="text-sm font-bold uppercase tracking-widest mt-1 text-gray-600">Player Report Card</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold uppercase tracking-widest text-gray-600">Date Generated</p>
                            <p className="text-lg font-bold">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Student Info */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-3xl font-bold font-oswald uppercase">{student.name}</h2>
                            <p className="text-gray-600 uppercase tracking-widest text-sm">{student.email}</p>
                        </div>
                    </div>

                    {/* Attendance Summary - NEW SECTION */}
                    <div className="mb-8 grid grid-cols-2 gap-4">
                        <div className="border border-gray-300 p-4 bg-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-500 text-xs uppercase tracking-widest">Games Attended</h3>
                                <p className="text-2xl font-bold">{attendanceStats.gamesAttended} <span className="text-gray-400 text-lg">/ {attendanceStats.totalGames}</span></p>
                            </div>
                            <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-black" style={{ width: `${attendanceStats.totalGames > 0 ? (attendanceStats.gamesAttended / attendanceStats.totalGames) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div className="border border-gray-300 p-4 bg-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-500 text-xs uppercase tracking-widest">Training Attended</h3>
                                <p className="text-2xl font-bold">{attendanceStats.trainingAttended} <span className="text-gray-400 text-lg">/ {attendanceStats.totalTraining}</span></p>
                            </div>
                            <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-black" style={{ width: `${attendanceStats.totalTraining > 0 ? (attendanceStats.trainingAttended / attendanceStats.totalTraining) * 100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold uppercase border-b border-black mb-4 pb-1">Performance Average</h3>
                        <div className="grid grid-cols-5 gap-4">
                            <div className="border border-gray-300 p-4 text-center bg-gray-50">
                                <div className="text-2xl font-bold text-black">{avgStats.points}</div>
                                <div className="text-xs uppercase font-bold text-gray-500">Points</div>
                            </div>
                            <div className="border border-gray-300 p-4 text-center bg-gray-50">
                                <div className="text-2xl font-bold text-black">{avgStats.rebounds}</div>
                                <div className="text-xs uppercase font-bold text-gray-500">Rebounds</div>
                            </div>
                            <div className="border border-gray-300 p-4 text-center bg-gray-50">
                                <div className="text-2xl font-bold text-black">{avgStats.assists}</div>
                                <div className="text-xs uppercase font-bold text-gray-500">Assists</div>
                            </div>
                            <div className="border border-gray-300 p-4 text-center bg-gray-50">
                                <div className="text-2xl font-bold text-black">{avgStats.steals}</div>
                                <div className="text-xs uppercase font-bold text-gray-500">Steals</div>
                            </div>
                            <div className="border border-gray-300 p-4 text-center bg-gray-50">
                                <div className="text-2xl font-bold text-black">{avgStats.blocks}</div>
                                <div className="text-xs uppercase font-bold text-gray-500">Blocks</div>
                            </div>
                        </div>
                    </div>

                    {/* Evaluations & Camps */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-lg font-bold uppercase border-b border-black mb-4 pb-1">Evaluations</h3>
                            {evaluations && evaluations.length > 0 ? (
                                <div className="space-y-4">
                                    {evaluations.slice(0, 3).map((evaluation: any) => (
                                        <div key={evaluation.id} className="border border-gray-200 p-3 bg-gray-50 text-sm">
                                            <div className="flex justify-between font-bold mb-1 border-b border-gray-200 pb-1">
                                                <span>{evaluation.training_sessions?.drill_topic}</span>
                                                <span>Rating: {evaluation.rating}/10</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                {evaluation.strengths && (
                                                    <div>
                                                        <span className="text-[10px] uppercase font-bold text-green-700 block">Strengths</span>
                                                        <span className="text-xs text-gray-700">{evaluation.strengths}</span>
                                                    </div>
                                                )}
                                                {evaluation.weaknesses && (
                                                    <div>
                                                        <span className="text-[10px] uppercase font-bold text-red-700 block">Improvement Areas</span>
                                                        <span className="text-xs text-gray-700">{evaluation.weaknesses}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {evaluation.coach_notes && <p className="italic text-gray-600 mt-2 text-xs border-t border-gray-100 pt-1">"{evaluation.coach_notes}"</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No evaluations recorded.</p>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold uppercase border-b border-black mb-4 pb-1">Enrolled Camps</h3>
                            {enrollments && enrollments.length > 0 ? (
                                <ul className="list-disc list-inside text-sm">
                                    {enrollments.map((e: any) => (
                                        <li key={e.id} className="mb-1">
                                            <span className="font-bold">{e.camps.name}</span> <span className="text-gray-600">({e.camps.location})</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 italic">No camps enrolled.</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Games Table */}
                    <div>
                        <h3 className="text-lg font-bold uppercase border-b border-black mb-4 pb-1">Recent Games Log</h3>
                        {gameStats && gameStats.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 uppercase text-xs font-bold text-gray-700">
                                    <tr>
                                        <th className="px-3 py-2">Date</th>
                                        <th className="px-3 py-2">Matchup</th>
                                        <th className="px-3 py-2 text-center">PTS</th>
                                        <th className="px-3 py-2 text-center">REB</th>
                                        <th className="px-3 py-2 text-center">AST</th>
                                        <th className="px-3 py-2 text-center">STL</th>
                                        <th className="px-3 py-2 text-center">BLK</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {gameStats.slice(0, 10).map((stat: any) => (
                                        <tr key={stat.id}>
                                            <td className="px-3 py-2">{new Date(stat.games.game_date).toLocaleDateString()}</td>
                                            <td className="px-3 py-2 w-1/3">{stat.games.team_1_name} vs {stat.games.team_2_name}</td>
                                            <td className="px-3 py-2 font-bold text-center">{stat.points}</td>
                                            <td className="px-3 py-2 text-center">{stat.rebounds}</td>
                                            <td className="px-3 py-2 text-center">{stat.assists}</td>
                                            <td className="px-3 py-2 text-center">{stat.steals}</td>
                                            <td className="px-3 py-2 text-center">{stat.blocks}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500 italic">No games recorded.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
