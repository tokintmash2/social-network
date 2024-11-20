import UserData from './UserData'

export default async function UserProfile({ params }: { params: { id: string } }) {
	const resolvedParams = await params
	const id = resolvedParams.id || params.id

	return (
		<div>
			<h1>Profile</h1>
			<p className='text-4xl'>
				Profile page of user:
				<span className='p-2'>{id}</span>
			</p>
			<UserData userId={id} />
		</div>
	)
}
