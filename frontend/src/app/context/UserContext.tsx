'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

type User = {
	id: string
}

type UserContextType = {
	loggedInUser: User | null
	setLoggedInUser: (user: User | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [loggedInUser, setLoggedInUser] = useState<User | null>(null)

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await axios.get('http://localhost:8080/verify-session', {
					withCredentials: true,
				})
				if (response.data.success) {
					setLoggedInUser(response.data.user)
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
