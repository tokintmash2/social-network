'use client'
import { usePathname } from 'next/navigation'
import { useCallback, useContext, useEffect, useState } from 'react'
import UsersList from './UsersList'
import { useLoggedInUser } from '../context/UserContext'
import { ChatContainer } from './ChatContainer'
import { WebSocketContext, channelTypes } from '../components/WsContext'
import { Message } from '../utils/types/types'


export function SocialFeatures() {
	const pathname = usePathname()
	const { loggedInUser } = useLoggedInUser()
	const isAuthPage = pathname.includes('/login') || pathname.includes('/register')
	const showSocialFeatures = loggedInUser && !isAuthPage
	const [activeChats, setActiveChats] = useState<number[]>([])
	const openChat = (id: number) => {
		console.log('activating', id)
		setActiveChats(Array.from(new Set([...activeChats, id]).values()))
	}

	const channel = channelTypes.chat_message()
    const [subscribe, unsubscribe] = useContext(WebSocketContext)
	const messageReceived = useCallback(
		(msg: Message) => {
			setActiveChats(Array.from(new Set([...activeChats, msg.sender_id]).values()))
		},
		[],
	)
	useEffect(() => {
		subscribe(channel, ({ data }: { data: Message }) => messageReceived(data))
		return () => unsubscribe(channel)
	}, [subscribe, unsubscribe])

	return showSocialFeatures ? (
		<>
			<UsersList onChat={openChat} />
			<ChatContainer activeChats={activeChats} setActiveChats={setActiveChats} />
		</>
	) : null
}
