'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingState from '@/components/ui/LoadingState'
import type { Profile } from '@/lib/types/database'
import QRCode from 'qrcode'
import Image from 'next/image'

export default function StudentProfilePage() {
    const router = useRouter()
    const supabase = createClient()

    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

    // Form inputs
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [address, setAddress] = useState('')
    const [mobileNo, setMobileNo] = useState('')
    const [emergencyContact, setEmergencyContact] = useState('')

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

        if (!profileData || profileData.role !== 'student') {
            router.push('/auth')
            return
        }

        setProfile(profileData)

        // Initialize form
        const nameParts = profileData.name.split(' ')
        if (nameParts.length > 0) {
            setFirstName(nameParts[0])
            setLastName(nameParts.slice(1).join(' '))
        }
        setAddress(profileData.address || '')
        setMobileNo(profileData.mobile_no || '')
        setEmergencyContact(profileData.emergency_contact_no || '')

        // Generate QR Code
        try {
            const url = await QRCode.toDataURL(profileData.id)
            setQrCodeUrl(url)
        } catch (err) {
            console.error(err)
        }

        setLoading(false)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!profile) return

        setSaving(true)
        const fullName = `${firstName} ${lastName}`.trim()

        const updates = {
            name: fullName,
            address,
            mobile_no: mobileNo,
            emergency_contact_no: emergencyContact,
            updated_at: new Date().toISOString(),
        }

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', profile.id)

        if (error) {
            alert('Error updating profile')
            console.error(error)
        } else {
            alert('Profile updated successfully')
            // Update local state to reflect changes immediately in Navbar if needed (though Navbar fetches its own mostly)
            setProfile({ ...profile, ...updates } as Profile)
        }
        setSaving(false)
    }

    const handleDownloadQR = () => {
        if (!qrCodeUrl) return
        const link = document.createElement('a')
        link.href = qrCodeUrl
        link.download = `student-qr-${profile?.id}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (loading) return <LoadingState message="Loading profile..." />
    if (!profile) return null

    return (
        <div className="min-h-screen bg-background">
            <Navbar profile={profile} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white font-oswald uppercase tracking-wide">Personal Details</h1>
                    <p className="text-gray-400 mt-2 uppercase tracking-widest text-xs">Manage your contact information and ID</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: QR Code */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="border-primary/30">
                            <CardHeader className="bg-primary/10 text-center">
                                <h2 className="text-xl font-bold text-primary font-oswald uppercase tracking-wider">Student ID</h2>
                            </CardHeader>
                            <CardBody className="flex flex-col items-center p-6 space-y-4">
                                {qrCodeUrl ? (
                                    <div className="bg-white p-2 rounded-lg">
                                        <Image src={qrCodeUrl} alt="Student QR Code" width={200} height={200} />
                                    </div>
                                ) : (
                                    <div className="h-48 w-48 bg-gray-800 animate-pulse rounded-lg"></div>
                                )}
                                <p className="text-xs text-gray-500 text-center">Scan this code for attendance</p>
                                <Button onClick={handleDownloadQR} variant="secondary" size="sm" className="w-full">
                                    Download QR Code
                                </Button>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Right Column: Edit Details Form */}
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-wider">Update Information</h2>
                            </CardHeader>
                            <CardBody>
                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="First Name"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                        />
                                        <Input
                                            label="Last Name"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <Input
                                        label="Address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Enter your full address"
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Mobile No."
                                            value={mobileNo}
                                            onChange={(e) => setMobileNo(e.target.value)}
                                            placeholder="e.g. 09123456789"
                                        />
                                        <Input
                                            label="Emergency Contact No."
                                            value={emergencyContact}
                                            onChange={(e) => setEmergencyContact(e.target.value)}
                                            placeholder="e.g. 09123456789"
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <Button type="submit" disabled={saving}>
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
