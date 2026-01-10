'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card, { CardBody, CardFooter, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Game, Camp, Profile } from '@/lib/types/database'
import Navbar from '@/components/layout/Navbar'
import LoadingState from '@/components/ui/LoadingState'

export default function GamesPage() {
    const [games, setGames] = useState<any[]>([])
    const [camps, setCamps] = useState<Camp[]>([])
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingGame, setEditingGame] = useState<Game | null>(null)

    // Form state
    const [campId, setCampId] = useState('')
    const [gameDate, setGameDate] = useState('')
    const [opponentName, setOpponentName] = useState('')

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

        // Get camps
        const { data: campsData } = await supabase
            .from('camps')
            .select('*')
            .order('name')

        if (campsData) setCamps(campsData)

        // Get games with camp details
        const { data: gamesData } = await supabase
            .from('games')
            .select('*, camps(*)')
            .order('game_date', { ascending: false })

        if (gamesData) setGames(gamesData)
        setLoading(false)
    }

    const resetForm = () => {
        setCampId('')
        setGameDate('')
        setOpponentName('')
        setEditingGame(null)
        setShowForm(false)
    }

    const handleEdit = (game: Game) => {
        setCampId(game.camp_id)
        setGameDate(game.game_date)
        setOpponentName(game.opponent_name)
        setEditingGame(game)
        setShowForm(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const gameData = {
            camp_id: campId,
            game_date: gameDate,
            opponent_name: opponentName,
        }

        if (editingGame) {
            const { error } = await supabase
                .from('games')
                .update(gameData)
                .eq('id', editingGame.id)

            if (!error) {
                loadData()
                resetForm()
            }
        } else {
            const { error } = await supabase
                .from('games')
                .insert(gameData)

            if (!error) {
                loadData()
                resetForm()
            }
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will also delete all stats for this game.')) return

        const { error } = await supabase
            .from('games')
            .delete()
            .eq('id', id)

        if (!error) {
            loadData()
        }
    }

    if (loading) {
        return <LoadingState message="Loading..." />
    }

    return (
        <div className="min-h-screen bg-background">
            {profile && <Navbar profile={profile} />}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white font-oswald uppercase tracking-wide">Games Management</h1>
                        <p className="text-gray-400 mt-1 uppercase tracking-widest text-xs">Create games and add player statistics</p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Game'}
                    </Button>
                </div>

                {showForm && (
                    <Card className="mb-8 border-primary/50 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                        <CardHeader>
                            <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-wider">
                                {editingGame ? 'Edit Game' : 'Create New Game'}
                            </h2>
                        </CardHeader>
                        <CardBody>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Camp
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder:text-gray-600 appearance-none"
                                        value={campId}
                                        onChange={(e) => setCampId(e.target.value)}
                                        required
                                    >
                                        <option value="" className="bg-gray-900 text-gray-400">Select a camp...</option>
                                        {camps.map((camp) => (
                                            <option key={camp.id} value={camp.id} className="bg-gray-900 text-white">
                                                {camp.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Game Date"
                                        type="date"
                                        value={gameDate}
                                        onChange={(e) => setGameDate(e.target.value)}
                                        required
                                    />
                                    <Input
                                        label="Opponent Name"
                                        type="text"
                                        placeholder="Phoenix Suns Jr."
                                        value={opponentName}
                                        onChange={(e) => setOpponentName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button type="submit">
                                        {editingGame ? 'Update Game' : 'Create Game'}
                                    </Button>
                                    <Button type="button" variant="secondary" onClick={resetForm}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                )}

                {games.length === 0 ? (
                    <Card>
                        <CardBody className="text-center py-12 text-gray-500">
                            No games created yet. Click "New Game" to get started!
                        </CardBody>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {games.map((game) => (
                            <Card key={game.id} hover className="group">
                                <CardBody>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white font-oswald uppercase tracking-wide group-hover:text-primary transition-colors">
                                                        vs {game.opponent_name}
                                                    </h3>
                                                    <p className="text-sm text-primary font-bold">{game.camps?.name}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                                                <span>📅</span> {new Date(game.game_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <a href={`/coach/games/${game.id}/stats`}>
                                                <Button size="sm" className="border border-gray-600 hover:border-primary" variant="ghost">Add/View Stats</Button>
                                            </a>
                                            <Button size="sm" variant="ghost" className="border border-gray-600 hover:text-primary hover:border-primary" onClick={() => handleEdit(game)}>
                                                Edit
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => handleDelete(game.id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
