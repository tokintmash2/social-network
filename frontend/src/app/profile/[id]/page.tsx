'use client'

import UserData from '../../components/UserData'
import Header from '../../components/Header'
import { useParams } from 'next/navigation'
import { useLoggedInUser } from '../../context/UserContext'

export default function UserProfile() {
	const { id } = useParams()
	const { loggedInUser } = useLoggedInUser()

	// Ensure `id` is a valid string before parsing
	const userId = id && typeof id === 'string' ? parseInt(id, 10) : null

	// Determine if the profile belongs to the logged-in user
	const isOwnProfile = userId !== null && loggedInUser?.id === userId

	return (
		<>
			<Header />
			{userId !== null && (
				<div className='container mx-auto pt-16'>
					<UserData userId={userId} isOwnProfile={isOwnProfile} />
				</div>
			)}
		</>
	)
}
