import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import type { Profile } from '@/lib/types/database'

export default async function CoachDashboard() {
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

    if (!profile || profile.role !== 'coach') {
        redirect('/auth')
    }

    // Get counts for dashboard overview
    const { count: campsCount } = await supabase
        .from('camps')
        .select('*', { count: 'exact', head: true })

    const { count: playersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')

    const { count: gamesCount } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true })

    const { count: sessionsCount } = await supabase
        .from('training_sessions')
        .select('*', { count: 'exact', head: true })

    // Get recent camps
    const { data: recentCamps } = await supabase
        .from('camps')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

    return (
        <div className="min-h-screen bg-background">
            <Navbar profile={profile as Profile} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white font-oswald uppercase tracking-wide">Coach Dashboard</h1>
                    <p className="text-gray-400 mt-1 tracking-wider uppercase text-sm">Manage camps, players, and track performance</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="hover:border-primary/50 transition-all duration-300 group">
                        <CardBody className="text-center">
                            <div className="text-4xl font-bold text-white group-hover:text-primary transition-colors">{campsCount || 0}</div>
                            <div className="text-gray-400 mt-1 text-xs uppercase tracking-widest">Total Camps</div>
                            <a href="/coach/camps">
                                <Button variant="ghost" size="sm" className="mt-3 w-full border border-gray-700 hover:border-primary">
                                    Manage
                                </Button>
                            </a>
                        </CardBody>
                    </Card>

                    <Card className="hover:border-primary/50 transition-all duration-300 group">
                        <CardBody className="text-center">
                            <div className="text-4xl font-bold text-white group-hover:text-primary transition-colors">{playersCount || 0}</div>
                            <div className="text-gray-400 mt-1 text-xs uppercase tracking-widest">Students</div>
                            <a href="/coach/players">
                                <Button variant="ghost" size="sm" className="mt-3 w-full border border-gray-700 hover:border-primary">
                                    View All
                                </Button>
                            </a>
                        </CardBody>
                    </Card>

                    <Card className="hover:border-primary/50 transition-all duration-300 group">
                        <CardBody className="text-center">
                            <div className="text-4xl font-bold text-white group-hover:text-primary transition-colors">{gamesCount || 0}</div>
                            <div className="text-gray-400 mt-1 text-xs uppercase tracking-widest">Games</div>
                            <a href="/coach/games">
                                <Button variant="ghost" size="sm" className="mt-3 w-full border border-gray-700 hover:border-primary">
                                    Manage
                                </Button>
                            </a>
                        </CardBody>
                    </Card>

                    <Card className="hover:border-primary/50 transition-all duration-300 group">
                        <CardBody className="text-center">
                            <div className="text-4xl font-bold text-white group-hover:text-primary transition-colors">{sessionsCount || 0}</div>
                            <div className="text-gray-400 mt-1 text-xs uppercase tracking-widest">Training Sessions</div>
                            <a href="/coach/training">
                                <Button variant="ghost" size="sm" className="mt-3 w-full border border-gray-700 hover:border-primary">
                                    Manage
                                </Button>
                            </a>
                        </CardBody>
                    </Card>
                </div>

                {/* Recent Camps */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-wider">Recent Camps</h2>
                            <a href="/coach/camps">
                                <Button size="sm" variant="secondary">View All</Button>
                            </a>
                        </div>
                    </CardHeader>
                    <CardBody>
                        {recentCamps && recentCamps.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-4 font-bold text-gray-400 uppercase text-xs tracking-wider">Camp Name</th>
                                            <th className="text-left py-3 px-4 font-bold text-gray-400 uppercase text-xs tracking-wider">Location</th>
                                            <th className="text-left py-3 px-4 font-bold text-gray-400 uppercase text-xs tracking-wider">Dates</th>
                                            <th className="text-left py-3 px-4 font-bold text-gray-400 uppercase text-xs tracking-wider">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentCamps.map((camp: any) => (
                                            <tr key={camp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 font-bold text-white">{camp.name}</td>
                                                <td className="py-4 px-4 text-gray-400">{camp.location}</td>
                                                <td className="py-4 px-4 text-gray-400">
                                                    {new Date(camp.start_date).toLocaleDateString()} - {new Date(camp.end_date).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-4 text-primary font-bold">${camp.price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p className="mb-4">No camps created yet.</p>
                                <a href="/coach/camps">
                                    <Button>Create Your First Camp</Button>
                                </a>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </main>
        </div>
    )
}
