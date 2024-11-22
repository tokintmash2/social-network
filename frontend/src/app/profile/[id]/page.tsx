'use client'

import UserData from '../../components/UserData'

import { useParams } from 'next/navigation'

export default function UserProfile() {
	const params = useParams()
	const id = params.id as string

	return (
		<div className='container mx-auto bg-base-100 px-4'>
			<UserData userId={id} accessType='PUBLIC' />
			{/* TODO: fetch accessType info. For now, hardcode */}
		</div>
	)
}
