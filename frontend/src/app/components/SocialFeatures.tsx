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
    const {subscribe} = useContext(WebSocketContext)!
	const messageReceived = useCallback(
		(msg: Message) => {
            setActiveChats((p) => {
                const exists = p.some((item) => (item.type == "user" && item.id == msg.sender_id))
                if (!exists) {
                    return [...p, { type: "user", id: msg.sender_id }]
                }
                return p
            })
        }, [],
	)
	useEffect(() => {
		const unsub = subscribe(channel, (payload: unknown) => {
            const { data } = payload as { data: Message }
            messageReceived(data)
        })
		return () => unsub()
	}, [subscribe, channel, messageReceived])

    const groupMessageReceived = useCallback(
		(msg: GroupMessage) => {
            setActiveChats((p) => {
                const exists = p.some((item) => (item.type == "group" && item.id == msg.group_id))
                if (!exists) {
                    return [...p, { type: "group", id: msg.group_id }]
                }
                return p
            })
		}, [],
	)
    useEffect(() => {
		const unsub = subscribe(groupchannel, (payload: unknown) => {
            const { data } = payload as { data: GroupMessage }
            groupMessageReceived(data)
        })
		return () => unsub()
	}, [subscribe, groupMessageReceived, groupchannel])

	return showSocialFeatures ? (
		<>
			<UsersList onChat={openChat} />
			<ChatContainer activeChats={activeChats} setActiveChats={setActiveChats} />
		</>
	) : null
}
