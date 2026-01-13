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
import { Scanner } from '@yudiel/react-qr-scanner'

export default function EvaluationsPage() {
    const params = useParams()
    const sessionId = params.sessionId as string

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [session, setSession] = useState<any>(null)
    const [students, setStudents] = useState<Profile[]>([])
    const [evaluations, setEvaluations] = useState<{ [key: string]: Evaluation }>({})
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)
    const [attendance, setAttendance] = useState<{ [key: string]: 'present' | 'absent' | 'excused' }>({})
    const [showScanner, setShowScanner] = useState(false)
    const [lastScannedId, setLastScannedId] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

            // Get attendance
            const { data: attendanceData } = await supabase
                .from('attendance')
                .select('*')
                .eq('training_session_id', sessionId)

            if (attendanceData) {
                const attendanceMap: { [key: string]: 'present' | 'absent' | 'excused' } = {}
                attendanceData.forEach((record) => {
                    attendanceMap[record.student_id] = record.status
                })
                setAttendance(attendanceMap)
            }

            setLoading(false)
        }

        if (sessionId) {
            loadData()
        }
    }, [sessionId, supabase, router])

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

    const handleAttendanceToggle = async (studentId: string, currentStatus: string | undefined) => {
        const newStatus = currentStatus === 'present' ? 'absent' : 'present'

        // Optimistic update
        setAttendance(prev => ({
            ...prev,
            [studentId]: newStatus
        }))

        // Check if record exists
        const { data: existingRecord } = await supabase
            .from('attendance')
            .select('id')
            .eq('training_session_id', sessionId)
            .eq('student_id', studentId)
            .single()

        let error
        if (existingRecord) {
            const result = await supabase
                .from('attendance')
                .update({ status: newStatus })
                .eq('id', existingRecord.id)
            error = result.error
        } else {
            const result = await supabase
                .from('attendance')
                .insert({
                    training_session_id: sessionId,
                    student_id: studentId,
                    status: newStatus
                })
            error = result.error
        }

        if (error) {
            // Revert on error
            console.error('Error updating attendance:', error)
            setAttendance(prev => ({
                ...prev,
                [studentId]: currentStatus as 'present' | 'absent' | 'excused'
            }))
        }
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

    const handleScan = (text: string) => {
        if (!text || text === lastScannedId) return

        // Assume text is the student ID
        const student = students.find(s => s.id === text)

        if (student) {
            // Only update if not already present
            if (attendance[student.id] !== 'present') {
                handleAttendanceToggle(student.id, attendance[student.id])
                alert(`Marked ${student.name} as Present!`)
            } else {
                alert(`${student.name} is already marked Present.`)
            }
            setLastScannedId(text)

            // Reset last scanned after delay to allow re-scanning if needed
            setTimeout(() => setLastScannedId(null), 3000)
        } else {
            // Could be invalid QR or student not in this camp
            console.warn('Student not found for ID:', text)
        }
    }

    const handleError = (error: unknown) => {
        console.error('QR Scan Error:', error)
    }

    if (loading) {
        return <LoadingState message="Loading..." />
    }

    if (!session) {
        return null
    }

    return (
        <div className="min-h-screen bg-background relative">
            {profile && <Navbar profile={profile} />}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex justify-between items-start">
                    <div>
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
                    <Button onClick={() => setShowScanner(true)} className="flex items-center gap-2">
                        <span>📷</span> Scan QR Attendance
                    </Button>
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
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={attendance[student.id] === 'present'}
                                                onChange={() => handleAttendanceToggle(student.id, attendance[student.id])}
                                                className="w-5 h-5 rounded border-gray-500 text-primary focus:ring-primary bg-transparent cursor-pointer"
                                            />
                                            <h3 className={`text-lg font-bold font-oswald uppercase tracking-wider ${attendance[student.id] === 'present' ? 'text-white' : 'text-gray-500'}`}>
                                                {student.name}
                                            </h3>
                                        </div>
                                        <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded ${attendance[student.id] === 'present' ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {attendance[student.id] === 'present' ? 'Present' : 'Absent'}
                                        </span>
                                    </CardHeader>
                                    <CardBody>
                                        {attendance[student.id] === 'present' ? (
                                            <div className="space-y-4 animate-in fade-in duration-300">
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
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center text-gray-500 italic">
                                                Mark as present to add evaluation
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* QR Scanner Modal */}
            {showScanner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
                    <div className="w-full max-w-md bg-white rounded-lg p-6 relative">
                        <button
                            onClick={() => setShowScanner(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-black font-bold text-xl"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-center font-oswald text-black">Scan Student QR Code</h2>
                        <div className="rounded-lg overflow-hidden border-2 border-primary">
                            <Scanner
                                onScan={(result) => {
                                    if (result && result.length > 0) {
                                        handleScan(result[0].rawValue)
                                    }
                                }}
                                onError={handleError}
                            />
                        </div>
                        <p className="text-center text-sm text-gray-500 mt-4">
                            Point camera at student QR code to mark attendance.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
