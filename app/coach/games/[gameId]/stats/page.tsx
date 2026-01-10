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
        } else {
            // Insert
            const { data, error } = await supabase
                .from('game_stats')
                .insert({
                    game_id: gameId,
                    student_id: studentId,
                    ...statData,
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

    if (loading) {
        return <LoadingState message="Loading..." />
    }

    if (!game) {
        return null
    }

    return (
        <div className="min-h-screen bg-background">
            {profile && <Navbar profile={profile} />}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <a href="/coach/games" className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs mb-4 inline-flex items-center gap-2 transition-colors">
                        ← Back to Games
                    </a>
                    <h1 className="text-3xl font-bold text-white font-oswald uppercase tracking-wide">Add Player Stats</h1>
                    <p className="text-primary font-bold mt-2 text-lg">
                        {game.camps?.name} <span className="text-white mx-2">•</span> <span className="text-white">vs</span> {game.opponent_name}
                    </p>
                    <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">
                        {new Date(game.game_date).toLocaleDateString()}
                    </p>
                </div>

                {students.length === 0 ? (
                    <Card>
                        <CardBody className="text-center py-12 text-gray-500">
                            No students enrolled in this camp yet.
                        </CardBody>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {students.map((student) => {
                            const studentStat = stats[student.id] || {
                                points: 0,
                                rebounds: 0,
                                assists: 0,
                                steals: 0,
                                blocks: 0,
                            }

                            return (
                                <Card key={student.id} className="border-white/10 hover:border-primary/50 transition-all duration-300">
                                    <CardHeader>
                                        <h3 className="text-lg font-bold text-white font-oswald uppercase tracking-wider">{student.name}</h3>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            <Input
                                                label="Points"
                                                type="number"
                                                min="0"
                                                value={studentStat.points}
                                                onChange={(e) => {
                                                    const newStat = { ...studentStat, points: parseInt(e.target.value) || 0 }
                                                    setStats({ ...stats, [student.id]: newStat as GameStat })
                                                }}
                                            />
                                            <Input
                                                label="Rebounds"
                                                type="number"
                                                min="0"
                                                value={studentStat.rebounds}
                                                onChange={(e) => {
                                                    const newStat = { ...studentStat, rebounds: parseInt(e.target.value) || 0 }
                                                    setStats({ ...stats, [student.id]: newStat as GameStat })
                                                }}
                                            />
                                            <Input
                                                label="Assists"
                                                type="number"
                                                min="0"
                                                value={studentStat.assists}
                                                onChange={(e) => {
                                                    const newStat = { ...studentStat, assists: parseInt(e.target.value) || 0 }
                                                    setStats({ ...stats, [student.id]: newStat as GameStat })
                                                }}
                                            />
                                            <Input
                                                label="Steals"
                                                type="number"
                                                min="0"
                                                value={studentStat.steals}
                                                onChange={(e) => {
                                                    const newStat = { ...studentStat, steals: parseInt(e.target.value) || 0 }
                                                    setStats({ ...stats, [student.id]: newStat as GameStat })
                                                }}
                                            />
                                            <Input
                                                label="Blocks"
                                                type="number"
                                                min="0"
                                                value={studentStat.blocks}
                                                onChange={(e) => {
                                                    const newStat = { ...studentStat, blocks: parseInt(e.target.value) || 0 }
                                                    setStats({ ...stats, [student.id]: newStat as GameStat })
                                                }}
                                            />
                                        </div>
                                        <div className="mt-6 flex gap-3">
                                            <Button
                                                onClick={() => handleSaveStat(student.id, studentStat)}
                                                disabled={saving === student.id}
                                                className="w-full md:w-auto"
                                            >
                                                {saving === student.id ? 'Saving...' : 'Save Stats'}
                                            </Button>
                                            {stats[student.id] && (
                                                <Button variant="danger" onClick={() => handleDelete(student.id)}>
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}
