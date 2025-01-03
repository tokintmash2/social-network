import { useCallback } from 'react'
import { Notification as NotificationType } from '../utils/types/notifications'
import axios, { AxiosError } from 'axios'

type NotificationProps = {
	notification: NotificationType
	onClick: () => void
}

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'

function formatDate(str: string) {
	const date = new Date(str)
	const year = date.getFullYear().toString().padStart(4, '0')
	const month = (date.getMonth() + 1).toString().padStart(2, '0')
	const day = date.getDate().toString().padStart(2, '0')
	const hours = date.getHours().toString().padStart(2, '0')
	const minutes = date.getMinutes().toString().padStart(2, '0')
	return `${year}-${month}-${day} ${hours}:${minutes}`
}

const Notification = ({ notification, onClick }: NotificationProps) => {

	const acceptFriendRequest = useCallback(async ({ followedUser_id, followingUser_id }: { followedUser_id: number, followingUser_id: number }) => {
		await axios.patch(
			`${backendUrl}/api/users/${followedUser_id}/followers/${followingUser_id}`,
			{},
			{ withCredentials: true },
		);
		onClick()
	}, [onClick])

	const denyFriendRequest = useCallback(async ({ followedUser_id, followingUser_id }: { followedUser_id: number, followingUser_id: number }) => {
		await axios.patch(
			`${backendUrl}/api/users/${followedUser_id}/followers/${followingUser_id}`,
			{},
			{ withCredentials: true },
		);
		onClick()
	}, [onClick])
	

	const acceptGroupMember = useCallback(async ({ group_id, user_id }: { group_id: number, user_id: number }) => {
		try {
			await axios.patch(
				`${backendUrl}/api/groups/${group_id}/members/${user_id}`,
				{},
				{ withCredentials: true },
			)
		} catch (err) {
			console.log("Failed to accept group membership", err)
		}
		onClick()
	}, [onClick])
	const denyGroupMember = useCallback(async ({ group_id, user_id }: { group_id: number, user_id: number }) => {
		try {
			await axios.delete(
				`${backendUrl}/api/groups/${group_id}/members/${user_id}`,
				{ withCredentials: true },
			);
		} catch (err) {
			console.log("Failed to deny group membership, probably not member any more", err)
		}
		onClick()
	}, [onClick])

	const renderActionButtons = () => {
		switch (notification.type) {
			case 'follow_request':
				if (!notification.extra) {
					return;
				}
				const friendReq = JSON.parse(notification.extra)
				return (
					<div className='flex gap-4 mt-2 items-center'>
						<button onClick={() => acceptFriendRequest(friendReq)} className='btn btn-xs btn-success'>Accept</button>
						<button onClick={() => denyFriendRequest(friendReq)} className='btn btn-xs btn-ghost'>Deny</button>
					</div>
				)
			case 'group_member_added':
				if (!notification.extra) {
					return;
				}
				const groupReq = JSON.parse(notification.extra)
				return (
					<div className='flex gap-4 mt-2 items-center'>
						<button onClick={() => acceptGroupMember(groupReq)} className='btn btn-xs btn-success'>Accept</button>
						<button onClick={() => denyGroupMember(groupReq)} className='btn btn-xs btn-ghost'>Deny</button>
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
		<div
			className='border-b last:border-b-0 hover:bg-base-200 transition-colors duration-200'
		>
			<div className={`flex flex-col gap-1 py-3 ${notification.read ? 'bg-white' : 'bg-blue-50/80'}`}>
				<button
					onClick={onClick}
				>
					<p className='text-sm'>{notification.message}</p>
					<p className='text-xs text-gray-500'>{formatDate(notification.timestamp)}</p>
				</button>
				{renderActionButtons()}
			</div>
		</div>
	)
}

export default Notification
