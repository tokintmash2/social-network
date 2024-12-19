'use client'

import { useState, useEffect } from "react"
import { User } from "../utils/types/types"
import axios from "axios"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { mapUserApiResponseToUser } from "../utils/userMapper"

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'

export default function UsersList() {
    const [isOpen, setIsOpen] = useState(false)
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await axios.get(`${backendUrl}/api/users/`, {
                withCredentials: true,
            })

            if (response.data.users) {
                setUsers(response.data.users.map(mapUserApiResponseToUser))
            }
        }
        fetchUsers()
    }, [backendUrl])

	return (
		<div className="fixed right-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white shadow-lg overflow-y-auto">
			<div className="p-4"></div>
			<div className="overflow-y-auto h-full">
                {users.map((user) => (
                    <UserCard key={user.id} user={user}/>
                ))}
			</div>
		</div>
	)
}

function UserCard({ user }: { user: User }) {
	return (
		<div className='p-4 hover:bg-gray-50 cursor-pointer'>
			<div className='flex items-center gap-3'>
				<div className='w-8 h-8 bg-gray-200 rounded-full'></div>
				<span>{user.username}</span>
			</div>
		</div>
	)
}
