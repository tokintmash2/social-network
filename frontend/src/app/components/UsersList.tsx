'use client'

import { useState } from "react"
import { User } from "../utils/types/types"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

export default function UsersList() {
    const [isOpen, setIsOpen] = useState(false)
    const [users, setUsers] = useState<User[]>([
        { id: 123, username: "testuser", dob: new Date(), email: "", firstName: "", lastName: "", isPublic: true },
        { id: 124, username: "testuser5", dob: new Date(), email: "", firstName: "", lastName: "", isPublic: true },
        { id: 125, username: "testuser4", dob: new Date(), email: "", firstName: "", lastName: "", isPublic: true },
    ])

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
