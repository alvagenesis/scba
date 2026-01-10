'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card, { CardBody, CardFooter, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { TrainingSession, Camp, Profile } from '@/lib/types/database'
import Navbar from '@/components/layout/Navbar'
import LoadingState from '@/components/ui/LoadingState'

export default function TrainingPage() {
    const [sessions, setSessions] = useState<any[]>([])
    const [camps, setCamps] = useState<Camp[]>([])
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingSession, setEditingSession] = useState<TrainingSession | null>(null)

    // Form state
    const [campId, setCampId] = useState('')
    const [sessionDate, setSessionDate] = useState('')
    const [drillTopic, setDrillTopic] = useState('')
    const [notes, setNotes] = useState('')

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

        // Get training sessions with camp details
        const { data: sessionsData } = await supabase
            .from('training_sessions')
            .select('*, camps(*)')
            .order('session_date', { ascending: false })

        if (sessionsData) setSessions(sessionsData)
        setLoading(false)
    }

    const resetForm = () => {
        setCampId('')
        setSessionDate('')
        setDrillTopic('')
        setNotes('')
        setEditingSession(null)
        setShowForm(false)
    }

    const handleEdit = (session: TrainingSession) => {
        setCampId(session.camp_id)
        setSessionDate(session.session_date)
        setDrillTopic(session.drill_topic)
        setNotes(session.notes || '')
        setEditingSession(session)
        setShowForm(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const sessionData = {
            camp_id: campId,
            session_date: sessionDate,
            drill_topic: drillTopic,
            notes: notes || null,
        }

        if (editingSession) {
            const { error } = await supabase
                .from('training_sessions')
                .update(sessionData)
                .eq('id', editingSession.id)

            if (!error) {
                loadData()
                resetForm()
            }
        } else {
            const { error } = await supabase
                .from('training_sessions')
                .insert(sessionData)

            if (!error) {
                loadData()
                resetForm()
            }
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will also delete all evaluations for this session.')) return

        const { error } = await supabase
            .from('training_sessions')
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
                        <h1 className="text-3xl font-bold text-white font-oswald uppercase tracking-wide">Training Sessions</h1>
                        <p className="text-gray-400 mt-1 uppercase tracking-widest text-xs">Create training sessions and add player evaluations</p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Session'}
                    </Button>
                </div>

                {showForm && (
                    <Card className="mb-8 border-primary/50 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                        <CardHeader>
                            <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-wider">
                                {editingSession ? 'Edit Training Session' : 'Create New Training Session'}
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
                                        label="Session Date"
                                        type="date"
                                        value={sessionDate}
                                        onChange={(e) => setSessionDate(e.target.value)}
                                        required
                                    />
                                    <Input
                                        label="Drill Topic"
                                        type="text"
                                        placeholder="Ball Handling Drills"
                                        value={drillTopic}
                                        onChange={(e) => setDrillTopic(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder:text-gray-600"
                                        rows={3}
                                        placeholder="Additional notes about the session..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button type="submit">
                                        {editingSession ? 'Update Session' : 'Create Session'}
                                    </Button>
                                    <Button type="button" variant="secondary" onClick={resetForm}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                )}

                {sessions.length === 0 ? (
                    <Card>
                        <CardBody className="text-center py-12 text-gray-500">
                            No training sessions created yet. Click "New Session" to get started!
                        </CardBody>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {sessions.map((session) => (
                            <Card key={session.id} hover className="group">
                                <CardBody>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white font-oswald uppercase tracking-wide group-hover:text-primary transition-colors">
                                                {session.drill_topic}
                                            </h3>
                                            <p className="text-sm text-primary font-bold">{session.camps?.name}</p>
                                            <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                                                <span>📅</span> {new Date(session.session_date).toLocaleDateString()}
                                            </p>
                                            {session.notes && (
                                                <p className="text-sm text-gray-400 mt-2 italic border-l-2 border-primary/30 pl-3">{session.notes}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <a href={`/coach/training/${session.id}/evaluations`}>
                                                <Button size="sm" className="border border-gray-600 hover:border-primary" variant="ghost">Add/View Evaluations</Button>
                                            </a>
                                            <Button size="sm" variant="ghost" className="border border-gray-600 hover:text-primary hover:border-primary" onClick={() => handleEdit(session)}>
                                                Edit
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => handleDelete(session.id)}>
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
