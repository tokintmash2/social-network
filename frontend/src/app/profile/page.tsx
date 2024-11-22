'use client'
import UserData from '../components/UserData'
import { useLoggedInUser } from '../context/UserContext'

// Show my profile page
export default function MyProfilePage() {
	const { loggedInUser } = useLoggedInUser()

	return (
		<div className='container mx-auto bg-base-100'>
			{loggedInUser && <UserData userId={loggedInUser.id} accessType='SELF' />}
		</div>
	)
}
