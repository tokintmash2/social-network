'use client'
import { usePathname } from 'next/navigation'
import { useCallback, useContext, useEffect, useState } from 'react'
import UsersList from './UsersList'
import { useLoggedInUser } from '../context/UserContext'
import { ChatContainer } from './ChatContainer'
import { WebSocketContext, channelTypes } from '../components/WsContext'
import { GroupMessage, Message } from '../utils/types/types'

export type ActiveChat = {
    type: string
    id: number
}

export function SocialFeatures() {
	const pathname = usePathname()
	const { loggedInUser } = useLoggedInUser()
	const isAuthPage = pathname.includes('/login') || pathname.includes('/register')
	const showSocialFeatures = loggedInUser && !isAuthPage
	const [activeChats, setActiveChats] = useState<ActiveChat[]>([])
	const openChat = (type:string, id: number) => {
		console.log('activating', type, id)
        const exists = activeChats.some((item) => (item.type == type && item.id == id))
        if (!exists) {
            setActiveChats([...activeChats, { type, id }])
        }
	}

	const channel = channelTypes.chat_message()
	const groupchannel = channelTypes.group_message()
    const [subscribe] = useContext(WebSocketContext)
	const messageReceived = useCallback(
		(msg: Message) => {
            const exists = activeChats.some((item) => (item.type == "user" && item.id == msg.sender_id))
            if (!exists) {
                setActiveChats([...activeChats, { type: "user", id: msg.sender_id }])
            }
		},
		[],
	)
	useEffect(() => {
		const unsub = subscribe(channel, ({ data }: { data: Message }) => messageReceived(data))
		return () => unsub()
	}, [subscribe])

    const groupMessageReceived = useCallback(
		(msg: GroupMessage) => {
            const exists = activeChats.some((item) => (item.type == "group" && item.id == msg.group_id))
            if (!exists) {
                setActiveChats([...activeChats, { type: "group", id: msg.group_id }])
            }
		},
		[],
	)
    useEffect(() => {
		const unsub = subscribe(groupchannel, ({ data }: { data: GroupMessage }) => groupMessageReceived(data))
		return () => unsub()
	}, [subscribe])

	return showSocialFeatures ? (
		<>
			<UsersList onChat={openChat} />
			<ChatContainer activeChats={activeChats} setActiveChats={setActiveChats} />
		</>
	) : null
}
