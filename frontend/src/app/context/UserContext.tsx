'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { mapUserApiResponseToUser } from '../utils/userMapper'
import { useRouter } from 'next/navigation'
import { User } from '../utils/types'
import axios from 'axios'

type UserContextType = {
	loggedInUser: User | null
	setLoggedInUser: (user: User | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
	const router = useRouter()
	const [loggedInUser, setLoggedInUser] = useState<User | null>(null)

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await axios.get('http://localhost:8080/verify-session', {
					withCredentials: true,
				})
				console.log('response', response.data)
				if (response.data.success) {
					setLoggedInUser(mapUserApiResponseToUser(response.data.user))
				} else {
					router.push('/login')
				}
			} catch (error) {
				console.log('No active session', error)
			}
		}

		fetchUser()
	}, [])

	return (
		<UserContext.Provider value={{ loggedInUser, setLoggedInUser }}>
			{children}
		</UserContext.Provider>
	)
}

export function useLoggedInUser() {
	const context = useContext(UserContext)
	if (context === undefined) {
		throw new Error('useUser must be used within a UserProvider')
	}
	return context
}
