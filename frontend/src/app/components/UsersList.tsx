'use client'

import { useState, useEffect, MouseEvent } from "react"
import { User } from "../utils/types/types"
import axios from "axios"
import Image from 'next/image'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { mapUserApiResponseToUser } from "../utils/userMapper"

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'

export default function UsersList({ onChat }: { onChat: Function }) {
    const [isOpen, setIsOpen] = useState(false)
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await axios.get(`${backendUrl}/api/chat/users`, {
                withCredentials: true,
            })

            if (response.data.users) {
                setUsers(response.data.users.map(mapUserApiResponseToUser))
            }
        }
        fetchUsers()
    }, [backendUrl])

    const handleUserClick = (ev: MouseEvent) => {
        const card = ev.target as HTMLElement;
        if (card.dataset.userId) {
            const id = parseInt(card.dataset.userId, 10)
            onChat(id)
        }
    }

	return (
		<div className="fixed right-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white shadow-lg overflow-y-auto">
			<div className="p-4"></div>
			<div className="overflow-y-auto h-full" onClick={handleUserClick}>
                {users.map((user) => (
                    <UserCard key={user.id} user={user}/>
                ))}
			</div>
		</div>
	)
}

function UserCard({ user }: { user: User }) {
    return (
        <div className='p-4 hover:bg-gray-50 cursor-pointer' data-user-id={user.id}>
            <div className='flex items-center gap-3 pointer-events-none'>
                {user.avatar && user.avatar !== 'default_avatar.jpg' ? (
                    <div className='w-8 h-8 rounded-full overflow-hidden'>
                        <Image
                            src={`${backendUrl}/uploads/${user.avatar}`}
                            alt={`${user.username}'s avatar`}
                            width={32}
                            height={32}
                            className='object-cover'
                        />
                    </div>
                ) : (
                    <div className='avatar placeholder'>
                        <div className='bg-neutral text-neutral-content w-8 h-8 rounded-full'>
                            <span className='text-xs uppercase'>
                                {user.firstName[0]}
                                {user.lastName[0]}
                            </span>
                        </div>
                    </div>
                )}
                <span>{user.username}</span>
            </div>
        </div>
    )
}
