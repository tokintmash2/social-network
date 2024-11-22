'use client'

import UserData from '../components/UserData'
import { useLoggedInUser } from '../context/UserContext'

// Show my profile page
export default function MyProfilePage() {
	// TODO: get my userId
	const { loggedInUser } = useLoggedInUser()
	console.log('loggedInUser', loggedInUser)

	return (
		<div className='container mx-auto bg-base-100'>
			<UserData userId='4' accessType='SELF' />{' '}
			{/* TODO: fetch my userId. For now, hardcode */}
		</div>
	)
}
