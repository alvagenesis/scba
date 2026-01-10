import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder:text-gray-600 ${error ? 'border-red-500 focus:border-red-500' : ''
                        } ${className}`}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input
