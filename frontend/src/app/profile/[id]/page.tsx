'use client'

import UserData from '../../components/UserData'
import Header from '../../components/Header'
import { useParams } from 'next/navigation'

export default function UserProfile() {
	const params = useParams()
	const id = params.id as string

	return (
		<>
			<Header />
			<div className='container mx-auto pt-16'>
				<UserData userId={parseInt(id)} accessType='PUBLIC' />
				{/* TODO: fetch accessType info. For now, hardcode */}
			</div>
		</>
	)
}
