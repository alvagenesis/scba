import Image from 'next/image'

interface LoadingStateProps {
    message?: string
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
    return (
        <div className="fixed inset-0 min-h-screen w-full bg-background flex flex-col items-center justify-center z-50">
            <div className="relative flex flex-col items-center">
                {/* Pulsing Logo */}
                <div className="relative w-32 h-32 mb-8 animate-pulse">
                    <Image
                        src="/batang-scba-logo.png"
                        alt="Loading..."
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Loading Spinner and Text */}
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <h2 className="text-primary font-oswald text-xl tracking-widest uppercase animate-pulse">
                        {message}
                    </h2>
                </div>
            </div>
        </div>
    )
}
