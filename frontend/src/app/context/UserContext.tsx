'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { mapUserApiResponseToUser } from '../utils/userMapper'
import { User } from '../utils/types/types'
import axios from 'axios'

type UserContextType = {
	loggedInUser: User | null
	setLoggedInUser: (user: User | null) => void
	loading: boolean
	refetchUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)
const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [loggedInUser, setLoggedInUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	// Function to fetch user data (shared for useEffect and manual updates)
	const refetchUser = async () => {
		setLoading(true)
		try {
			const response = await axios.get(`${backendUrl}/api/verify-session`, {
				withCredentials: true,
			})
			setLoggedInUser(mapUserApiResponseToUser(response.data.user))
		} catch (error) {
			setLoggedInUser(null)
			console.log('No active session', error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		refetchUser()
	}, [])

	return (
		<UserContext.Provider value={{ loggedInUser, setLoggedInUser, loading, refetchUser }}>
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
