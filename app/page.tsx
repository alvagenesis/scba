import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] left-[20%] w-[200px] h-[200px] bg-white/5 rounded-full blur-[50px]" />
      </div>

      {/* Navigation / Header */}
      <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="relative h-16 w-48">
            <Image
              src="/batang-scba-logo.png"
              alt="Batang SCBA Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-300 uppercase tracking-widest">
          <Link href="#" className="hover:text-primary transition-colors">About</Link>
          <Link href="#" className="hover:text-primary transition-colors">Camps</Link>
          <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-block mb-4 px-3 py-1 border border-primary/30 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-sm">
            Elevate Your Game
          </div>

          <div className="relative w-full max-w-[600px] aspect-video mb-10 mx-auto">
            <Image
              src="/batang-scba-hero.png"
              alt="BATANG SCBA - Bawal Mahina Mentality"
              fill
              className="object-contain"
              priority
            />
          </div>

          <p className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto font-light leading-relaxed text-balance">
            The ultimate platform for managing elite basketball camps. Track stats, monitor development, and unlock potential using data-driven insights.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto w-full">
            {/* Coach Card */}
            <div className="group relative bg-card border border-white/10 hover:border-primary/50 text-left p-8 rounded-none transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,215,0,0.1)]">
              <div className="absolute top-0 left-0 w-1 h-0 bg-primary group-hover:h-full transition-all duration-300" />
              <div className="text-4xl mb-6 bg-white/5 w-16 h-16 flex items-center justify-center rounded-full group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                👨‍🏫
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 font-oswald uppercase">For Coaches</h3>
              <p className="text-gray-500 mb-8 min-h-[60px] text-sm">
                Manage rosters, input game stats, and generate professional evaluation reports for players.
              </p>
              <Link href="/auth?role=coach">
                <button className="w-full py-4 bg-transparent border border-gray-700 text-white font-bold hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 uppercase tracking-widest text-sm flex items-center justify-between px-6 group-hover:pl-8">
                  <span>Access Portal</span>
                  <span>→</span>
                </button>
              </Link>
            </div>

            {/* Student Card */}
            <div className="group relative bg-card border border-white/10 hover:border-primary/50 text-left p-8 rounded-none transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,215,0,0.1)]">
              <div className="absolute top-0 left-0 w-1 h-0 bg-primary group-hover:h-full transition-all duration-300" />
              <div className="text-4xl mb-6 bg-white/5 w-16 h-16 flex items-center justify-center rounded-full group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                🏃‍♂️
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 font-oswald uppercase">For Athletes</h3>
              <p className="text-gray-500 mb-8 min-h-[60px] text-sm">
                Track your progress logs, view performance analytics, and receive feedback from coaches.
              </p>
              <Link href="/auth?role=student">
                <button className="w-full py-4 bg-transparent border border-gray-700 text-white font-bold hover:bg-primary hover:text-black hover:border-primary transition-all duration-300 uppercase tracking-widest text-sm flex items-center justify-between px-6 group-hover:pl-8">
                  <span>Student Login</span>
                  <span>→</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-gray-600 text-xs uppercase tracking-widest">
        <p>&copy; 2026 Basketball Camp Management System</p>
      </footer>
    </div>
  )
}
