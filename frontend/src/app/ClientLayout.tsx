'use client'

import { usePathname } from 'next/navigation'
import { useLoggedInUser, UserProvider } from './context/UserContext'
import UsersList from './components/UsersList'
import Messenger from './components/Messenger'
import { useState } from 'react'

function SocialFeatures() {
    const pathname = usePathname()
    const { loggedInUser } = useLoggedInUser()
    const isAuthPage = pathname.includes('/login') || pathname.includes('/register')
    const showSocialFeatures = loggedInUser && !isAuthPage
    const [ activeChats, setActiveChats ] = useState<number[]>([])
    const openChat = (id: number) => {
        console.log("Open chat with:", id)
        setActiveChats(Array.from(new Set([...activeChats, id]).values()))
    }
    const closeChat = (id: number) => {
        console.log("Close chat with:", id)
        const s = new Set([...activeChats])
        s.delete(id)
        setActiveChats(Array.from(s.values()))
    }

    return showSocialFeatures ? (
        <>
            <UsersList onChat={openChat} />
            <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-4">
                {activeChats.map((id, index) => (
                    <Messenger 
                        key={`chat-${id}`}
                        onClose={closeChat}
                        receiverID={id}
                        chatIndex={index}
                    />
                ))}
            </div>
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