'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import UsersList from './UsersList'
import { useLoggedInUser } from '../context/UserContext'
import { ChatContainer } from './ChatContainer'

export function SocialFeatures() {
	const pathname = usePathname()
	const { loggedInUser } = useLoggedInUser()
	const isAuthPage = pathname.includes('/login') || pathname.includes('/register')
	const showSocialFeatures = loggedInUser && !isAuthPage
    const [activeChats, setActiveChats] = useState<number[]>([])
	const openChat = (id: number) => {
        console.log("activating", id)
		setActiveChats(Array.from(new Set([...activeChats, id]).values()))
	}
	
	return showSocialFeatures ? (
		<>
			<UsersList onChat={openChat} />
			<ChatContainer activeChats={activeChats} setActiveChats={setActiveChats} />
		</>
	) : null
}
