'use client'

import { usePathname } from 'next/navigation'
import { useLoggedInUser, UserProvider } from './context/UserContext'
import UsersList from './components/UsersList'
import Messenger from './components/Messenger'

function SocialFeatures() {
    const pathname = usePathname()
    const { loggedInUser } = useLoggedInUser()
    const isAuthPage = pathname.includes('/login') || pathname.includes('/register')
    const showSocialFeatures = loggedInUser && !isAuthPage

    return showSocialFeatures ? (
        <>
            <UsersList />
            <Messenger />
        </>
    ) : null
}

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