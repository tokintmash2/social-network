'use client'
import UserData from '../components/UserData'
import Header from '../components/Header'
import { useLoggedInUser } from '../context/UserContext'

// Show my profile page
export default function MyProfilePage() {
	const { loggedInUser, loading } = useLoggedInUser()

	if (loading) {
		return <div>Loading...</div>
	}

	return (
		<div>
			<Header />
			<div className='container mx-auto'>
				{loggedInUser ? (
					<UserData userId={loggedInUser.id} accessType='SELF' />
				) : (
					<div>Please log in to view your profile.</div>
				)}
			</div>
		</div>
	)
}
