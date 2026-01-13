'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugQRPage() {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const [manualId, setManualId] = useState('c1de1d05-aea6-43bc-9a72-986b21da2949')

    useEffect(() => {
        const fetchStudents = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'student')
                .limit(5)

            if (data) setStudents(data)
            setLoading(false)
        }
        fetchStudents()
    }, [])

    if (loading) return <div className="p-8">Loading students...</div>

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Test QR Codes</h1>

            <div className="mb-12 p-6 bg-gray-50 rounded-xl border">
                <h2 className="text-xl font-bold mb-4">Generate Custom QR</h2>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student ID (UUID)</label>
                        <input
                            type="text"
                            value={manualId}
                            onChange={(e) => setManualId(e.target.value)}
                            className="w-full p-2 border rounded font-mono text-sm"
                            placeholder="Paste UUID here..."
                        />
                    </div>
                </div>
                {manualId && (
                    <div className="mt-6 flex items-center gap-6 bg-white p-4 rounded-lg border w-fit">
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${manualId}`}
                            alt="Custom QR"
                            className="w-40 h-40"
                        />
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Scan to test ID:</p>
                            <p className="font-mono font-bold text-lg">{manualId}</p>
                        </div>
                    </div>
                )}
            </div>

            <h2 className="text-xl font-bold mb-4">Sample Data (Recent Students)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {students.map(student => (
                    <div key={student.id} className="border rounded-lg p-6 bg-white shadow-sm flex items-center gap-6">
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${student.id}`}
                            alt={`QR for ${student.name}`}
                            className="w-32 h-32 border"
                        />
                        <div>
                            <h3 className="font-bold text-lg">{student.name}</h3>
                            <p className="text-sm text-gray-500 font-mono mb-2">{student.id}</p>
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                Student
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {students.length === 0 && (
                <div className="text-red-500">No students found in the database.</div>
            )}
        </div>
    )
}
