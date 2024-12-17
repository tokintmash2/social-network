'use client'

import { usePathname } from 'next/navigation'
import { useLoggedInUser, UserProvider } from './context/UserContext'
import UsersList from './components/UsersList'
import Messenger from './components/Messenger'

function SocialFeatures() {
	const pathname = usePathname()
	const { loggedInUser } = useLoggedInUser()

	const isAuthPage = pathname.includes('/login') || pathname.includes('/register')
	const showSocialFeatures = loggedInUser && !isAuthPage

	return showSocialFeatures ? (
		<>
			<UsersList />
			<Messenger />
		</>
	) : null
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
	return (
		<UserProvider>
			{children}
			<SocialFeatures />
		</UserProvider>
	)
}
