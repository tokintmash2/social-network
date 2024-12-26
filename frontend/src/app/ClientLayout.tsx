'use client'

import { usePathname } from 'next/navigation'
import { UserProvider } from './context/UserContext'
import { SocialFeatures } from './components/SocialFeatures'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAuthPage = pathname.includes('/login') || pathname.includes('/register')

    return (
        <UserProvider>
            <div className="flex min-h-screen">
                <div className={`flex-1 ${!isAuthPage ? 'mr-64' : ''}`}>
                    {children}
                </div>
                <SocialFeatures />
            </div>
        </UserProvider>
    )
}