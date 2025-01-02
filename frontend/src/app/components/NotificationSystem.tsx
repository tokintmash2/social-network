import { useCallback, useContext, useEffect, useState } from 'react'
import { Notification } from '../utils/types/notifications'
import NotificationsContainer from '../containers/NotificationsContainer'
import { channelTypes, WebSocketContext } from './WsContext'
import axios from 'axios'

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'

const NotificationSystem = () => {
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [unreadCount, setUnreadCount] = useState(0)

	const handleNotificationClick = async (notification: Notification) => {
		await axios.patch(
			`${backendUrl}/api/notifications/${encodeURIComponent(notification.id)}`,
			{},
			{
				withCredentials: true,
			},
		)
		setNotifications((p) =>
			p.map((item) => {
				if (item.id == notification.id) {
					item.read = true
					// Remove the actionable extra info part when read
					delete item.extra
				}
				return item
			}),
		)
	}

	useEffect(() => {
		const fetchNotifications = async () => {
			const response = await axios.get(
				`${backendUrl}/api/notifications`,
				{
					withCredentials: true,
				},
			)
			setNotifications(response.data.notifications)
		}
		fetchNotifications()
	}, [])

	const channel = channelTypes.notification()
	const { subscribe } = useContext(WebSocketContext)!
	const messageReceived = useCallback((msg: Notification) => {
		setNotifications((p) => [...p, msg])
	}, [])
	useEffect(() => {
		const unsub = subscribe(channel, (payload: unknown) => {
			const { data } = payload as { data: Notification }
			messageReceived(data)
		})
		return () => unsub()
	}, [subscribe, channel, messageReceived])

	useEffect(() => {
		setUnreadCount(notifications.filter((n) => !n.read).length)
	}, [notifications])

	return (
		<div className='dropdown dropdown-end'>
			<div tabIndex={0} role='button' className='indicator'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					fill='none'
					viewBox='0 0 24 24'
					strokeWidth={1.5}
					stroke='currentColor'
					className='size-6'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0'
					/>
				</svg>
				{unreadCount > 0 && (
					<span className='badge badge-sm indicator-item'>{unreadCount}</span>
				)}
			</div>
			<NotificationsContainer
				notifications={notifications}
				onNotificationClick={handleNotificationClick}
			/>
		</div>
	)
}

export default NotificationSystem
