'use client'

import { createContext, useContext, useState } from 'react'

type LoggedInUser = {
	email?: string
	id: string
	firstName?: string
	lastName?: string
	dob?: Date | null // Date or null for dob
	avatar?: File // Optional
	username?: string // Optional
	about?: string // Optional
}

type UserContextType = {
	loggedInUser: LoggedInUser | null // The user data object that can be null when no user is logged in
	setLoggedInUser: (loggedInUser: LoggedInUser | null) => void // A function that will update the user state. It accepts either a LoggedInUser object (when logging in) or null (when logging out). Returns nothing
}

// createContext: Creates a context to store the user state and the setUser function.
// Default Value: The default value for the context is undefined. This ensures that any component trying to access the context outside of a UserProvider throws an error (handled later).
const UserContext = createContext<UserContextType | undefined>(undefined)
export function UserProvider({ children }: { children: React.ReactNode }) {
	const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null)

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
