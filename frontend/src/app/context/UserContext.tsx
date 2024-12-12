'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { mapUserApiResponseToUser } from '../utils/userMapper'
import { User } from '../utils/types/types'
import axios from 'axios'

type UserContextType = {
	loggedInUser: User | null
	setLoggedInUser: (user: User | null) => void
	loading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)
const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [loggedInUser, setLoggedInUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await axios.get(`${backendUrl}/api/verify-session`, {
					withCredentials: true,
				})
				console.log('response', response.data)

				setLoggedInUser(mapUserApiResponseToUser(response.data.user)) // normalize the response's format
			} catch (error) {
				setLoggedInUser(null)
				console.log('No active session', error)
			} finally {
				setLoading(false) // Set loading to false after the request completes
			}
		}

		fetchUser()
	}, [])

	return (
		<UserContext.Provider value={{ loggedInUser, setLoggedInUser, loading }}>
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
