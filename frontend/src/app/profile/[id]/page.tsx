'use client'

import { useState, useEffect } from 'react'
import UserData from '../../components/UserData'
import Header from '../../components/Header'
import { useParams } from 'next/navigation'
import { useLoggedInUser } from '../../context/UserContext'

export default function UserProfile() {
	const params = useParams()
	const id = params.id as string

	const [isOwnProfile, setIsOwnProfile] = useState<boolean | undefined>(undefined)

	const { loggedInUser } = useLoggedInUser()

	useEffect(() => {
		setIsOwnProfile(loggedInUser?.id === parseInt(id) ? true : false)
	}, [loggedInUser])

	return (
		<>
			<Header />
			{isOwnProfile !== undefined && (
				<div className='container mx-auto pt-16'>
					<UserData userId={parseInt(id)} isOwnProfile={isOwnProfile} />
					{/* TODO: fetch accessType info. For now, hardcode */}
				</div>
			)}
		</>
	)
}
