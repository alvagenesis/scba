'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Profile, Evaluation } from '@/lib/types/database'
import Navbar from '@/components/layout/Navbar'
import LoadingState from '@/components/ui/LoadingState'

export default function EvaluationsPage() {
    const params = useParams()
    const sessionId = params.sessionId as string

    const [session, setSession] = useState<any>(null)
    const [students, setStudents] = useState<Profile[]>([])
    const [evaluations, setEvaluations] = useState<{ [key: string]: Evaluation }>({})
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        if (sessionId) {
            loadData()
        }
    }, [sessionId])

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

        // Get session details with camp
        const { data: sessionData } = await supabase
            .from('training_sessions')
            .select('*, camps(*)')
            .eq('id', sessionId)
            .single()

        if (!sessionData) {
            router.push('/coach/training')
            return
        }

        setSession(sessionData)

        // Get students enrolled in this camp
        const { data: enrollments } = await supabase
            .from('enrollments')
            .select('profiles(*)')
            .eq('camp_id', sessionData.camp_id)

        if (enrollments) {
            const studentProfiles = enrollments.map((e: any) => e.profiles).filter(Boolean)
            setStudents(studentProfiles)
        }

        // Get existing evaluations for this session
        const { data: evaluationsData } = await supabase
            .from('evaluations')
            .select('*')
            .eq('training_session_id', sessionId)

        if (evaluationsData) {
            const evaluationsMap: { [key: string]: Evaluation } = {}
            evaluationsData.forEach((evaluation) => {
                evaluationsMap[evaluation.student_id] = evaluation
            })
            setEvaluations(evaluationsMap)
        }

        setLoading(false)
    }

    const handleSaveEvaluation = async (studentId: string, evaluationData: Partial<Evaluation>) => {
        setSaving(studentId)

        const existingEvaluation = evaluations[studentId]

        if (existingEvaluation?.id) {
            // Update
            const { error } = await supabase
                .from('evaluations')
                .update(evaluationData)
                .eq('id', existingEvaluation.id)

            if (!error) {
                setEvaluations({
                    ...evaluations,
                    [studentId]: { ...existingEvaluation, ...evaluationData } as Evaluation,
                })
            }
        } else {
            // Insert
            const { data, error } = await supabase
                .from('evaluations')
                .insert({
                    training_session_id: sessionId,
                    student_id: studentId,
                    ...evaluationData,
                })
                .select()
                .single()

            if (!error && data) {
                setEvaluations({
                    ...evaluations,
                    [studentId]: data,
                })
            }
        }

        setSaving(null)
    }

    const handleDelete = async (studentId: string) => {
        const existingEvaluation = evaluations[studentId]
        if (!existingEvaluation) return

        if (!confirm('Delete evaluation for this player?')) return

        const { error } = await supabase
            .from('evaluations')
            .delete()
            .eq('id', existingEvaluation.id)

        if (!error) {
            const newEvaluations = { ...evaluations }
            delete newEvaluations[studentId]
            setEvaluations(newEvaluations)
        }
    }

    if (loading) {
        return <LoadingState message="Loading..." />
    }

    if (!session) {
        return null
    }

    return (
        <div className="min-h-screen bg-background">
            {profile && <Navbar profile={profile} />}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <a href="/coach/training" className="text-gray-400 hover:text-primary font-bold uppercase tracking-widest text-xs mb-4 inline-flex items-center gap-2 transition-colors">
                        ← Back to Training Sessions
                    </a>
                    <h1 className="text-3xl font-bold text-white font-oswald uppercase tracking-wide">Add Player Evaluations</h1>
                    <p className="text-primary font-bold mt-2 text-lg">
                        {session.camps?.name} <span className="text-white mx-2">•</span> {session.drill_topic}
                    </p>
                    <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">
                        {new Date(session.session_date).toLocaleDateString()}
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
                            const studentEvaluation = evaluations[student.id] || {
                                rating: 5,
                                strengths: '',
                                weaknesses: '',
                                coach_notes: '',
                            }

                            return (
                                <Card key={student.id} className="border-white/10 hover:border-primary/50 transition-all duration-300">
                                    <CardHeader>
                                        <h3 className="text-lg font-bold text-white font-oswald uppercase tracking-wider">{student.name}</h3>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                                    Rating (1-10)
                                                </label>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="10"
                                                    value={studentEvaluation.rating}
                                                    onChange={(e) => {
                                                        const newEval = { ...studentEvaluation, rating: parseInt(e.target.value) }
                                                        setEvaluations({ ...evaluations, [student.id]: newEval as Evaluation })
                                                    }}
                                                    className="w-full accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <div className="text-center mt-2">
                                                    <span className="text-3xl font-bold text-primary font-oswald">{studentEvaluation.rating}/10</span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                                    Strengths
                                                </label>
                                                <textarea
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder:text-gray-600"
                                                    rows={2}
                                                    placeholder="What did the player do well?"
                                                    value={studentEvaluation.strengths || ''}
                                                    onChange={(e) => {
                                                        const newEval = { ...studentEvaluation, strengths: e.target.value }
                                                        setEvaluations({ ...evaluations, [student.id]: newEval as Evaluation })
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                                    Areas to Improve
                                                </label>
                                                <textarea
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder:text-gray-600"
                                                    rows={2}
                                                    placeholder="What should the player work on?"
                                                    value={studentEvaluation.weaknesses || ''}
                                                    onChange={(e) => {
                                                        const newEval = { ...studentEvaluation, weaknesses: e.target.value }
                                                        setEvaluations({ ...evaluations, [student.id]: newEval as Evaluation })
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                                    Coach Notes
                                                </label>
                                                <textarea
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder:text-gray-600"
                                                    rows={2}
                                                    placeholder="Additional notes..."
                                                    value={studentEvaluation.coach_notes || ''}
                                                    onChange={(e) => {
                                                        const newEval = { ...studentEvaluation, coach_notes: e.target.value }
                                                        setEvaluations({ ...evaluations, [student.id]: newEval as Evaluation })
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-6 flex gap-3">
                                            <Button
                                                onClick={() => handleSaveEvaluation(student.id, studentEvaluation)}
                                                disabled={saving === student.id}
                                                className="w-full md:w-auto"
                                            >
                                                {saving === student.id ? 'Saving...' : 'Save Evaluation'}
                                            </Button>
                                            {evaluations[student.id] && (
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
