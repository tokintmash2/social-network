'use client'

import {
	useEffect,
	useState,
	FormEvent,
	KeyboardEvent,
	useRef,
	useContext,
	useCallback,
} from 'react'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faWindowMinimize, faPaperPlane, faSmile } from '@fortawesome/free-solid-svg-icons'
import { Message, User } from '../utils/types/types'
import { mapUserApiResponseToUser } from '../utils/userMapper'
import axios from 'axios'
import { WebSocketContext, channelTypes } from '../components/WsContext'
import { useLoggedInUser } from '../context/UserContext'
import Image from 'next/image'
import Link from 'next/link'

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'

export default function Messenger({
	onClose,
	receiverID,
}: {
	onClose: (id: number) => void
	receiverID: number
}) {
	const [isMinimized, setIsMinimized] = useState(false)
	const [messageContent, setMessageContent] = useState('')
	const [user, setUser] = useState<User>()
	const [messages, setMessages] = useState<Message[]>([])
	const [earliest, setEarliest] = useState('')
	const [latest, setLatest] = useState('')
	const { subscribe } = useContext(WebSocketContext)!
	const [showEmojiPicker, setShowEmojiPicker] = useState(false)

	const onEmojiClick = (emojiObject: EmojiClickData) => {
		setMessageContent((prev) => prev + emojiObject.emoji)
	}

	const msgListRef = useRef(null)
	const msgScrollDetect = useRef(null)
	const channel = channelTypes.chat_message()

	const { loggedInUser } = useLoggedInUser()
	const isMyUser = (id: number) => {
		return loggedInUser != null && loggedInUser.id == id
	}

	const messageReceived = useCallback(
		(msg: Message) => {
			if (msg.sender_id == receiverID) {
				setMessages((p) => [...p, msg])
				setLatest(msg.sent_at)
			}
		},
		[receiverID],
	)

	useEffect(() => {
		const unsub = subscribe(channel, (payload: unknown) => {
			const { data } = payload as { data: Message }
			messageReceived(data)
		})
		return () => unsub()
	}, [subscribe, channel, messageReceived])

	const onSubmit = async (ev: FormEvent) => {
		ev.preventDefault()
		const form = ev.target as HTMLFormElement
		const text = form.messageContent.value.trim()
		if (!text.length) {
			return
		}
		const res = await axios.post(
			`${backendUrl}/api/chat`,
			{
				message: text,
				receiver: receiverID,
			},
			{
				withCredentials: true,
			},
		)
		setMessageContent('')
		form.reset()
		if (res.data.data) {
			setMessages([...messages, res.data.data])
			setLatest(res.data.data.sent_at)
		}
	}

	const submitOnEnter = (ev: KeyboardEvent) => {
		if (ev.key == 'Enter' && !ev.shiftKey) {
			ev.preventDefault()
			ev.stopPropagation()
			const form = (ev.target as HTMLTextAreaElement).form
			form?.requestSubmit()
		}
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
				// Find the latest timestamp
				setLatest(response.data.data.messages.reduce(
					(acc: string, val: { sent_at: string }) => (
						val.sent_at > acc ? val.sent_at : acc
					), ""
				))
			}
		}
		fetchMessages()
	}, [receiverID])

	useEffect(() => {
		if (msgListRef.current != null) {
			const list = msgListRef.current as HTMLElement
			list.lastElementChild?.scrollIntoView()
		}
	}, [msgListRef, latest])

	useEffect(() => {
		if (!earliest.length) {
			return
		}
		const fetchMessages = async (timestamp: string) => {
			const response = await axios.get(
				`${backendUrl}/api/chat/${encodeURIComponent(receiverID)}?timestamp=${encodeURIComponent(timestamp)}`,
				{
					withCredentials: true,
				},
			)
			if (response.data.data.messages) {
				setMessages((p) => {
					const msgs = [...p, ...response.data.data.messages]
					msgs.sort((a, b) => (a.sent_at < b.sent_at ? -1 : 1))
					return msgs
				})

				// Scroll back to the element that triggered load more
				if (msgListRef.current !== null) {
					const list = msgListRef.current as HTMLElement
					for (const node of list.childNodes) {
						if (node instanceof HTMLElement && node.dataset.timestamp === earliest) {
							node.scrollIntoView()
							break
						}
					}
				}
			}
		}
		fetchMessages(earliest)
	}, [earliest, receiverID])

	useEffect(() => {
		if (msgScrollDetect.current === null || msgListRef.current === null) {
			return
		}
		const observerOptions = {
			root: msgListRef.current,
			rootMargin: '0px', // No margin added around the root
			threshold: 0, // Trigger as soon as even one pixel is visible
		}

		const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
			console.log('intersection callback called')
			if (!entries[0].isIntersecting) {
				return
			}
			const timestamps = messages.map((m) => m.sent_at)
			timestamps.sort()
			setEarliest(timestamps.shift() || '')
		}, observerOptions)
		console.log('observing!!!')
		observer.observe(msgScrollDetect.current)

		return () => {
			// Stop observing when unloaded
			console.log('unobserving!!!')
			observer.disconnect()
		}
	}, [msgListRef, msgScrollDetect, messages])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (showEmojiPicker && event.target instanceof Element) {
				const emojiPicker = document.querySelector('.EmojiPickerReact')
				if (emojiPicker && !emojiPicker.contains(event.target)) {
					setShowEmojiPicker(false)
				}
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [showEmojiPicker])

	if (isMinimized) {
		return (
			<div>
				<button
					onClick={() => setIsMinimized(false)}
					className='w-12 h-12 rounded-full bg-white shadow-lg hover:bg-gray-50 flex items-center justify-center overflow-hidden'
				>
					{user?.avatar && user.avatar !== 'default_avatar.jpg' ? (
						<Image
							src={`${backendUrl}/uploads/${user.avatar}`}
							alt={`${user.username}'s avatar`}
							width={48}
							height={48}
							className='object-cover'
						/>
					) : (
						<span className='text-lg uppercase'>
							{user?.firstName[0]}
							{user?.lastName[0]}
						</span>
					)}
				</button>
			</div>
		)
	}

	return (
		<div className='fixed bottom-4 right-4 z-50'>
			<div className='w-80 h-96 bg-white rounded-lg shadow-lg flex flex-col'>
				<div className='p-4 border-b flex justify-between items-center'>
					<div className='p-4 border-b flex justify-between items-center'>
						<Link
							href={`/profile/${receiverID}`}
							className='hover:underline cursor-pointer'
						>
							<h3 className='font-semibold'>{user?.username}</h3>
						</Link>
					</div>

					<div className='flex gap-2'>
						<button
							onClick={() => setIsMinimized(true)}
							className='hover:bg-gray-100 p-1 rounded-full relative'
						>
							<FontAwesomeIcon
								icon={faWindowMinimize}
								className='w-4 h-4 transform -translate-y-[6px]'
							/>
						</button>
						<button
							onClick={() => onClose(receiverID)}
							className='hover:bg-gray-100 p-1 rounded-full'
						>
							<FontAwesomeIcon icon={faXmark} className='w-5 h-5' />
						</button>
					</div>
				</div>

				{/* Chat messages container */}
				<div className='flex-1 overflow-y-auto p-4' ref={msgListRef}>
					{messages.length ? <div ref={msgScrollDetect}>&nbsp;</div> : ''}
					{messages.map((message) => (
						<MessageBubble
							key={message.chat_id}
							message={message}
							isMyUser={isMyUser}
						/>
					))}
				</div>

				{/* Message input area */}
				<form onSubmit={onSubmit}>
					<div className='p-4 border-t'>
						<div className='flex gap-2'>
							<div className='relative'>
								<button
									type='button'
									className='btn btn-circle btn-ghost btn-sm'
									onClick={() => setShowEmojiPicker(!showEmojiPicker)}
								>
									<FontAwesomeIcon icon={faSmile} />
								</button>
								{showEmojiPicker && (
									<div className='absolute bottom-20 left-0 z-50 -translate-x-[200px]'>
										<EmojiPicker onEmojiClick={onEmojiClick} />
									</div>
								)}
							</div>
							<textarea
								placeholder='Type a message...'
								className='textarea textarea-bordered w-full min-h-[40px] resize-none'
								value={messageContent}
								name='messageContent'
								onKeyDown={submitOnEnter}
								onChange={(e) => setMessageContent(e.target.value)}
							/>
							<button
								className='btn btn-circle btn-outline'
								disabled={!messageContent.trim()}
								type='submit'
							>
								<FontAwesomeIcon className='text-base/6' icon={faPaperPlane} />
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	)
}

function MessageBubble({ message, isMyUser }: { message: Message; isMyUser: (id: number) => boolean }) {
	const bubbleType = isMyUser(message.sender_id) ? 'chat chat-end' : 'chat chat-start'
	return (
		<div className={bubbleType} data-timestamp={message.sent_at}>
			<div className='chat-image avatar'>
				<div className='avatar placeholder'>
					<div className='bg-neutral text-neutral-content w-10 rounded-full'>
						<span className='text-xs uppercase'>
							{message.sender_name
								.split(' ')
								.map((n) => n[0])
								.join('')}
						</span>
					</div>
				</div>
			</div>
			<div className='chat-bubble'>
				<div className='whitespace-pre-line	overflow-hidden'>{message.message}</div>
			</div>
		</div>
	)
}
