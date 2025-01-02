import { useCallback } from 'react'
import { Notification as NotificationType } from '../utils/types/notifications'
import axios from 'axios'

type NotificationProps = {
	notification: NotificationType
	onClick: () => void
}

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'

const Notification = ({ notification, onClick }: NotificationProps) => {
	const acceptGroupMember = useCallback(async ({ group_id, user_id }: { group_id: number, user_id: number }) => {
		await axios.patch(
			`${backendUrl}/api/groups/${group_id}/members/${user_id}`,
			{},
			{ withCredentials: true },
		);
		onClick()
	}, [onClick])
	const denyGroupMember = useCallback(async ({ group_id, user_id }: { group_id: number, user_id: number }) => {
		await axios.delete(
			`${backendUrl}/api/groups/${group_id}/members/${user_id}`,
			{ withCredentials: true },
		);
		onClick()
	}, [onClick])

	const renderActionButtons = () => {
		switch (notification.type) {
			case 'friend_request':
				return (
					<div className='flex gap-4 mt-2 items-center'>
						<button className='btn btn-xs btn-success'>Accept</button>
						<button className='btn btn-xs btn-ghost'>Delete</button>
					</div>
				)
			case 'group_member_added':
				if (!notification.extra) {
					return;
				}
				const extra = JSON.parse(notification.extra)
				return (
					<div className='flex gap-4 mt-2 items-center'>
						<button onClick={() => acceptGroupMember(extra)} className='btn btn-xs btn-success'>Accept</button>
						<button onClick={() => denyGroupMember(extra)} className='btn btn-xs btn-ghost'>Deny</button>
					</div>
				)
			case 'event_request':
				return (
					<div className='flex gap-4 mt-2 items-center'>
						<button className='btn btn-xs btn-success'>Going</button>
						<button className='btn btn-xs btn-ghost'>Not Going</button>
					</div>
				)
			default:
				return null
		}
	}

	return (
		<button
			onClick={onClick}
			className='border-b last:border-b-0 hover:bg-base-200 transition-colors duration-200'
		>
			<a
				className={`flex flex-col gap-1 py-3 ${notification.read ? 'bg-white' : 'bg-blue-50/80'}`}
			>
				<span className='text-sm'>{notification.message}</span>
				<span className='text-xs text-gray-500'>{notification.timestamp}</span>
				{renderActionButtons()}
			</a>
		</button>
	)
}

export default Notification
