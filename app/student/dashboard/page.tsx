import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { calculateAverageStats } from '@/lib/utils/stats'
import type { Profile, GameStat, EvaluationWithDetails } from '@/lib/types/database'

export default async function StudentDashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    // Get profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'student') {
        redirect('/auth')
    }

    // Get enrollments
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*, camps(*)')
        .eq('student_id', user.id)

    // Get all game stats for the student
    const { data: gameStats } = await supabase
        .from('game_stats')
        .select('*')
        .eq('student_id', user.id)

    // Get all evaluations for the student
    const { data: evaluations } = await supabase
        .from('evaluations')
        .select('*, training_sessions(*)')
        .eq('student_id', user.id)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

    // Get attendance records
    const { data: attendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', user.id)

    // Calculate Attendance Stats
    const campIds = enrollments?.map((e: any) => e.camp_id) || []

    // Get total games in enrolled camps
    const { count: totalGames } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
        .in('camp_id', campIds)

    // Get total training sessions in enrolled camps
    const { count: totalTraining } = await supabase
        .from('training_sessions')
        .select('*', { count: 'exact', head: true })
        .in('camp_id', campIds)

    const gamesAttended = attendance?.filter(a => a.game_id && a.status === 'present').length || 0
    const trainingAttended = attendance?.filter(a => a.training_session_id && a.status === 'present').length || 0

    const avgStats = calculateAverageStats(gameStats || [])

    return (
        <div className="min-h-screen bg-background">
            <Navbar profile={profile as Profile} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white font-oswald uppercase tracking-wide">Welcome, {profile.name}!</h1>
                    <p className="text-gray-400 mt-2 uppercase tracking-widest text-xs">Track your basketball camp progress</p>
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
                                <span className="text-3xl font-bold text-primary">{gamesAttended}</span>
                                <span className="text-gray-500 text-xl font-bold mx-1">/</span>
                                <span className="text-xl font-bold text-gray-400">{totalGames || 0}</span>
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
                                <span className="text-3xl font-bold text-primary">{trainingAttended}</span>
                                <span className="text-gray-500 text-xl font-bold mx-1">/</span>
                                <span className="text-xl font-bold text-gray-400">{totalTraining || 0}</span>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Enrolled Camps */}
                    <div>
                        <Card className="h-full">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-wider">My Camps</h2>
                                    <a href="/student/camps">
                                        <Button size="sm" variant="secondary">Browse Camps</Button>
                                    </a>
                                </div>
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
                                        <p className="mb-4">You haven't enrolled in any camps yet.</p>
                                        <a href="/student/camps">
                                            <Button>Browse Available Camps</Button>
                                        </a>
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
                                                            {evaluation.training_sessions.drill_topic}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                                                            {new Date(evaluation.training_sessions.session_date).toLocaleDateString()}
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
                                        No evaluations yet. Your coach will add evaluations after training sessions.
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
                            <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-wider">Performance Summary</h2>
                        </CardHeader>
                        <CardBody>
                            <div className="p-4">
                                <p className="text-gray-300">
                                    You've played in <span className="font-bold text-primary text-xl mx-1">{avgStats.gamesPlayed}</span> game(s) with the current statistics.
                                </p>
                            </div>
                        </CardBody>
                    </Card>
                )}
            </main>
        </div>
    )
}
