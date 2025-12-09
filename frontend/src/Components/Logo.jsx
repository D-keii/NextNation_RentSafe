import { Shield } from "lucide-react"
export default function Logo({ size = 'md', showText = true }){
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-13 w-13',
        lg: 'h-12 w-12',
    }

    const textSizeClasses ={
        sm: 'text-xl',
        md: 'text-2xl',
        lg: 'text-3xl',
    }

    return (
        <div className="flex items-center gap-2">
        <div className="relative">
            <div className="gradient-primary rounded-lg p-2">
            <Shield className={`${sizeClasses[size]} text-primary-foreground`} />
            </div>
        </div>
        {showText && (
            <span className={`font-bold ${textSizeClasses[size]} text-foreground`}>
            Rent<span className="text-accent">Safe</span>
            </span>
        )}
        </div>
    );
    
}