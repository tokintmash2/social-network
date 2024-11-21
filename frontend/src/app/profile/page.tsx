import UserData from '../components/UserData'
import { cookies } from 'next/headers'

// Show my profile page
export default async function MyProfilePage() {
	const cookieStore = cookies()
	const sessionId = (await cookieStore).get('session')?.value
	console.log('sessionId', sessionId)

	// TODO: get my userId

	return (
		<div className='container mx-auto bg-base-100'>
			<UserData userId='4' accessType='SELF' />{' '}
			{/* TODO: fetch my userId. For now, hardcode */}
		</div>
	)
}
