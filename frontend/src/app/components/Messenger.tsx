'use client'

import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faWindowMinimize, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { User } from '../utils/types/types'
import { mapUserApiResponseToUser } from '../utils/userMapper'
import axios from 'axios'

type Message = {
	chat_id: number
	sender_id: number
	sender_name: string
	receiver_id: number
	receiver_name: string
	sent_at: string
	message: string
}

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'

export default function Messenger({
	onClose,
	receiverID,
}: {
	onClose: Function
	receiverID: number
}) {
	const [isMinimized, setIsMinimized] = useState(false)
	const [messageContent, setMessageContent] = useState('')
	const [user, setUser] = useState<User>()
	const [messages, setMessages] = useState<Message[]>([])
    const isMyUser = (id : number) => {
        // if it's not the receiver it must be me
        // TODO: actually should look up my own userID
        return id != receiverID;
    }

	useEffect(() => {
		const fetchMessages = async () => {
			const response = await axios.get(
				`${backendUrl}/api/chat/${encodeURIComponent(receiverID)}`,
				{
					withCredentials: true,
				},
			)

			if (response.data.data.profile) {
				setUser(mapUserApiResponseToUser(response.data.data.profile))
			}
			if (response.data.data.messages) {
				setMessages(response.data.data.messages)
			}
		}
		fetchMessages()
	}, [backendUrl])

	if (isMinimized) {
		return (
			<div className='fixed bottom-4 right-4 z-50'>
				<button
					onClick={() => setIsMinimized(false)}
					className='bg-white px-4 py-2 rounded-t-lg shadow-lg font-semibold hover:bg-gray-50'
				>
					Messages
				</button>
			</div>
		)
	}

	return (
		<div className='fixed bottom-4 right-4 z-50'>
			<div className='w-80 h-96 bg-white rounded-lg shadow-lg flex flex-col'>
				<div className='p-4 border-b flex justify-between items-center'>
					<h3 className='font-semibold'>{user?.username}</h3>
					<button
						onClick={() => setIsMinimized(true)}
						className='hover:bg-gray-100 p-1 rounded-full'
					>
						<FontAwesomeIcon icon={faWindowMinimize} className='w-5 h-5' />
					</button>
					<button
						onClick={() => onClose(receiverID)}
						className='hover:bg-gray-100 p-1 rounded-full'
					>
						<FontAwesomeIcon icon={faXmark} className='w-5 h-5' />
					</button>
				</div>

				{/* Chat messages container */}
				<div className='flex-1 overflow-y-auto p-4'>
					{messages.map((message) => (
                        <MessageBubble key={message.chat_id} message={message} isMyUser={isMyUser}/>
                    ))}
				</div>

				{/* Message input area */}
				<div className='p-4 border-t'>
					<div className='flex gap-2'>
						<textarea
							placeholder='Type a message...'
							className='textarea textarea-bordered w-full min-h-[40px] resize-none'
							value={messageContent}
							onChange={(e) => setMessageContent(e.target.value)}
						/>
						<button
							className='btn btn-circle btn-outline'
							disabled={!messageContent.trim()}
						>
							<FontAwesomeIcon className='text-base/6' icon={faPaperPlane} />
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

function MessageBubble({ message, isMyUser }: { message: Message, isMyUser: Function}) {
    const bubbleType = isMyUser(message.sender_id) ? "chat chat-end" : "chat chat-start"
	return (
		<div className={bubbleType}>
			<div className='chat-image avatar'>
				<div className='w-10 rounded-full'>
					<img
						alt='Tailwind CSS chat bubble component'
						src='https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
					/>
				</div>
			</div>
			<div className='chat-bubble'>{message.message}</div>
		</div>
	)
}
