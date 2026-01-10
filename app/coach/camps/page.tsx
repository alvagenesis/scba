'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card, { CardBody, CardFooter, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Camp, Profile } from '@/lib/types/database'
import Navbar from '@/components/layout/Navbar'
import LoadingState from '@/components/ui/LoadingState'

export default function CampsManagementPage() {
    const [camps, setCamps] = useState<Camp[]>([])
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingCamp, setEditingCamp] = useState<Camp | null>(null)

    // Form state
    const [name, setName] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [price, setPrice] = useState('')
    const [location, setLocation] = useState('')
    const [description, setDescription] = useState('')

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

        const { data: campsData } = await supabase
            .from('camps')
            .select('*')
            .order('start_date', { ascending: false })

        if (campsData) setCamps(campsData)
        setLoading(false)
    }

    const resetForm = () => {
        setName('')
        setStartDate('')
        setEndDate('')
        setPrice('')
        setLocation('')
        setDescription('')
        setEditingCamp(null)
        setShowForm(false)
    }

    const handleEdit = (camp: Camp) => {
        setName(camp.name)
        setStartDate(camp.start_date)
        setEndDate(camp.end_date)
        setPrice(camp.price.toString())
        setLocation(camp.location)
        setDescription(camp.description || '')
        setEditingCamp(camp)
        setShowForm(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const campData = {
            name,
            start_date: startDate,
            end_date: endDate,
            price: parseFloat(price),
            location,
            description: description || null,
        }

        if (editingCamp) {
            // Update existing camp
            const { error } = await supabase
                .from('camps')
                .update(campData)
                .eq('id', editingCamp.id)

            if (!error) {
                loadData()
                resetForm()
            }
        } else {
            // Create new camp
            const { error } = await supabase
                .from('camps')
                .insert(campData)

            if (!error) {
                loadData()
                resetForm()
            }
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this camp?')) return

        const { error } = await supabase
            .from('camps')
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
                        <h1 className="text-3xl font-bold text-white font-oswald uppercase tracking-wide">Manage Camps</h1>
                        <p className="text-gray-400 mt-1 uppercase tracking-widest text-xs">Create and manage basketball camps</p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Camp'}
                    </Button>
                </div>

                {showForm && (
                    <Card className="mb-8 border-primary/50 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                        <CardHeader>
                            <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-wider">
                                {editingCamp ? 'Edit Camp' : 'Create New Camp'}
                            </h2>
                        </CardHeader>
                        <CardBody>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Camp Name"
                                        type="text"
                                        placeholder="Summer Basketball Camp"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                    <Input
                                        label="Location"
                                        type="text"
                                        placeholder="Los Angeles, CA"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="Start Date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                    />
                                    <Input
                                        label="End Date"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        required
                                    />
                                    <Input
                                        label="Price ($)"
                                        type="number"
                                        step="0.01"
                                        placeholder="299.99"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder:text-gray-600"
                                        rows={3}
                                        placeholder="Describe the camp, activities, and what students will learn..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button type="submit">
                                        {editingCamp ? 'Update Camp' : 'Create Camp'}
                                    </Button>
                                    <Button type="button" variant="secondary" onClick={resetForm}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                )}

                {camps.length === 0 ? (
                    <Card>
                        <CardBody className="text-center py-12 text-gray-500">
                            No camps created yet. Click "New Camp" to get started!
                        </CardBody>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {camps.map((camp) => (
                            <Card key={camp.id} hover className="group">
                                <CardHeader className="bg-white/5 border-b border-white/10">
                                    <h3 className="text-xl font-bold text-white font-oswald uppercase tracking-wider group-hover:text-primary transition-colors">{camp.name}</h3>
                                </CardHeader>
                                <CardBody>
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-400 flex items-center gap-2">
                                            <span className="text-primary">📍</span> {camp.location}
                                        </p>
                                        <p className="text-sm text-gray-400 flex items-center gap-2">
                                            <span className="text-primary">📅</span> {new Date(camp.start_date).toLocaleDateString()} - {new Date(camp.end_date).toLocaleDateString()}
                                        </p>
                                        <p className="text-2xl font-bold text-white">${camp.price}</p>
                                        {camp.description && (
                                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{camp.description}</p>
                                        )}
                                    </div>
                                </CardBody>
                                <CardFooter>
                                    <div className="flex gap-2">
                                        <Button className="flex-1 border border-gray-600 hover:border-primary" size="sm" variant="ghost" onClick={() => handleEdit(camp)}>
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleDelete(camp.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
