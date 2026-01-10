import { ReactNode } from 'react'

interface CardProps {
    children: ReactNode
    className?: string
    hover?: boolean
}

export default function Card({ children, className = '', hover = false }: CardProps) {
    return (
        <div className={`bg-card rounded-none border border-white/10 ${hover ? 'hover:border-primary/50 hover:shadow-[0_0_30px_rgba(255,215,0,0.1)] transition-all duration-300' : ''} ${className}`}>
            {children}
        </div>
    )
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`px-6 py-4 border-b border-white/5 ${className}`}>{children}</div>
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`px-6 py-4 ${className}`}>{children}</div>
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`px-6 py-4 border-t border-white/5 bg-white/5 ${className}`}>{children}</div>
}
