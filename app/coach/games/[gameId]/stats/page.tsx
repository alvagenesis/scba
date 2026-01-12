'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Profile, GameStat } from '@/lib/types/database'
import Navbar from '@/components/layout/Navbar'
import LoadingState from '@/components/ui/LoadingState'

export default function GameStatsPage() {
    const params = useParams()
    const gameId = params.gameId as string

    const [game, setGame] = useState<any>(null)
    const [students, setStudents] = useState<Profile[]>([])
    const [stats, setStats] = useState<{ [key: string]: GameStat }>({})
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        if (gameId) {
            loadData()
        }
    }, [gameId])

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

        // Get game details with camp
        const { data: gameData } = await supabase
            .from('games')
            .select('*, camps(*)')
            .eq('id', gameId)
            .single()

        if (!gameData) {
            router.push('/coach/games')
            return
        }

        setGame(gameData)

        // Get students enrolled in this camp
        const { data: enrollments } = await supabase
            .from('enrollments')
            .select('profiles(*)')
            .eq('camp_id', gameData.camp_id)

        if (enrollments) {
            const studentProfiles = enrollments.map((e: any) => e.profiles).filter(Boolean)
            setStudents(studentProfiles)
        }

        // Get existing stats for this game
        const { data: statsData } = await supabase
            .from('game_stats')
            .select('*')
            .eq('game_id', gameId)

        if (statsData) {
            const statsMap: { [key: string]: GameStat } = {}
            statsData.forEach((stat) => {
                statsMap[stat.student_id] = stat
            })
            setStats(statsMap)
        }

        setLoading(false)
    }

    const handleAssignTeam = async (studentId: string, team: 'team_1' | 'team_2' | null) => {
        const existingStat = stats[studentId]

        if (existingStat?.id) {
            // Update existing
            const { error } = await supabase
                .from('game_stats')
                .update({ team_choice: team })
                .eq('id', existingStat.id)

            if (!error) {
                setStats({
                    ...stats,
                    [studentId]: { ...existingStat, team_choice: team } as GameStat
                })
            }
        } else {
            // Create new with defaults if assigning to a team
            if (team) {
                const { data, error } = await supabase
                    .from('game_stats')
                    .insert({
                        game_id: gameId,
                        student_id: studentId,
                        team_choice: team,
                        points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0
                    })
                    .select()
                    .single()

                if (!error && data) {
                    setStats({
                        ...stats,
                        [studentId]: data,
                    })
                }
            }
        }
    }

    const handleSaveStat = async (studentId: string, statData: Partial<GameStat>) => {
        setSaving(studentId)

        const existingStat = stats[studentId]

        if (existingStat?.id) {
            // Update
            const { error } = await supabase
                .from('game_stats')
                .update(statData)
                .eq('id', existingStat.id)

            if (!error) {
                setStats({
                    ...stats,
                    [studentId]: { ...existingStat, ...statData } as GameStat,
                })
            }
        }
        setSaving(null)
    }

    const handleDelete = async (studentId: string) => {
        const existingStat = stats[studentId]
        if (!existingStat) return

        if (!confirm('Delete stats for this player?')) return

        const { error } = await supabase
            .from('game_stats')
            .delete()
            .eq('id', existingStat.id)

        if (!error) {
            const newStats = { ...stats }
            delete newStats[studentId]
            setStats(newStats)
        }
    }

    if (loading) return <LoadingState message="Loading..." />
    if (!game) return null

    // Filter students
    const unassignedStudents = students.filter(s => !stats[s.id] || !stats[s.id].team_choice)
    const team1Students = students.filter(s => stats[s.id]?.team_choice === 'team_1')
    const team2Students = students.filter(s => stats[s.id]?.team_choice === 'team_2')

    const renderStatCard = (student: Profile) => {
        const studentStat = stats[student.id]
        return (
            <Card key={student.id} className="border-white/10 hover:border-primary/50 transition-all duration-300">
                <CardHeader>
                    <h3 className="text-lg font-bold text-white font-oswald uppercase tracking-wider">{student.name}</h3>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <Input label="Points" type="number" min="0" value={studentStat.points} onChange={(e) => handleSaveStat(student.id, { points: parseInt(e.target.value) || 0 })} />
                        <Input label="Rebounds" type="number" min="0" value={studentStat.rebounds} onChange={(e) => handleSaveStat(student.id, { rebounds: parseInt(e.target.value) || 0 })} />
                        <Input label="Assists" type="number" min="0" value={studentStat.assists} onChange={(e) => handleSaveStat(student.id, { assists: parseInt(e.target.value) || 0 })} />
                        <Input label="Steals" type="number" min="0" value={studentStat.steals} onChange={(e) => handleSaveStat(student.id, { steals: parseInt(e.target.value) || 0 })} />
                        <Input label="Blocks" type="number" min="0" value={studentStat.blocks} onChange={(e) => handleSaveStat(student.id, { blocks: parseInt(e.target.value) || 0 })} />
                    </div>
                </CardBody>
            </Card>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {profile && <Navbar profile={profile} />}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <a href="/coach/games" className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs mb-4 inline-flex items-center gap-2 transition-colors">
                        ← Back to Games
                    </a>
                    <h1 className="text-3xl font-bold text-white font-oswald uppercase tracking-wide">Game Roster & Stats</h1>
                    <p className="text-primary font-bold mt-2 text-lg">
                        {game.team_1_name} <span className="text-white mx-2">vs</span> {game.team_2_name}
                    </p>
                    <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">
                        {game.camps?.name} • {new Date(game.game_date).toLocaleDateString()}
                    </p>
                </div>

                {/* Roster Assignment Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Unassigned */}
                    <Card className="h-full">
                        <CardHeader className="bg-gray-900/50">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Unassigned Students ({unassignedStudents.length})</h3>
                        </CardHeader>
                        <CardBody className="max-h-96 overflow-y-auto space-y-2">
                            {unassignedStudents.map(student => (
                                <div key={student.id} className="p-3 bg-white/5 rounded border border-white/10 flex justify-between items-center group">
                                    <span className="text-white font-bold text-sm">{student.name}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAssignTeam(student.id, 'team_1')} className="px-3 py-2 text-xs bg-primary text-black font-bold hover:bg-white rounded transition-colors">T1</button>
                                        <button onClick={() => handleAssignTeam(student.id, 'team_2')} className="px-3 py-2 text-xs bg-white text-black font-bold hover:bg-gray-200 rounded transition-colors">T2</button>
                                    </div>
                                </div>
                            ))}
                            {unassignedStudents.length === 0 && <p className="text-xs text-gray-500 text-center py-4">All students assigned</p>}
                        </CardBody>
                    </Card>

                    {/* Team 1 Roster */}
                    <Card className="h-full border-primary/20">
                        <CardHeader className="bg-primary/10">
                            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">{game.team_1_name} ({team1Students.length})</h3>
                        </CardHeader>
                        <CardBody className="max-h-96 overflow-y-auto space-y-2">
                            {team1Students.map(student => (
                                <div key={student.id} className="p-3 bg-primary/5 rounded border border-primary/20 flex justify-between items-center group">
                                    <span className="text-white font-bold text-sm">{student.name}</span>
                                    <button onClick={() => handleAssignTeam(student.id, null)} className="px-2 py-2 text-xs text-red-400 hover:text-red-300 transition-colors">Remove</button>
                                </div>
                            ))}
                        </CardBody>
                    </Card>

                    {/* Team 2 Roster */}
                    <Card className="h-full border-white/20">
                        <CardHeader className="bg-white/10">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{game.team_2_name} ({team2Students.length})</h3>
                        </CardHeader>
                        <CardBody className="max-h-96 overflow-y-auto space-y-2">
                            {team2Students.map(student => (
                                <div key={student.id} className="p-3 bg-white/5 rounded border border-white/20 flex justify-between items-center group">
                                    <span className="text-white font-bold text-sm">{student.name}</span>
                                    <button onClick={() => handleAssignTeam(student.id, null)} className="px-2 py-2 text-xs text-red-400 hover:text-red-300 transition-colors">Remove</button>
                                </div>
                            ))}
                        </CardBody>
                    </Card>
                </div>

                {/* Stats Entry Section */}
                <div className="space-y-12">
                    {team1Students.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-primary font-oswald uppercase tracking-wide mb-6 border-b border-primary/20 pb-2">{game.team_1_name} Stats</h2>
                            <div className="space-y-4">
                                {team1Students.map(renderStatCard)}
                            </div>
                        </div>
                    )}

                    {team2Students.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-white font-oswald uppercase tracking-wide mb-6 border-b border-white/20 pb-2">{game.team_2_name} Stats</h2>
                            <div className="space-y-4">
                                {team2Students.map(renderStatCard)}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
