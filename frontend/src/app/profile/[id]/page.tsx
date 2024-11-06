export default function UserProfile({ params }: { params: { id: string } }) {
	return (
		<div>
			<h1>Profile</h1>
			<p className='text-4xl'>
				Profile page of user:
				<span className='p-2'>{params.id}</span>
			</p>
		</div>
	)
}
