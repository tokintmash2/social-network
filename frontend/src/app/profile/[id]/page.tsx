import UserData from '../../components/UserData'

type Params = Promise<{ id: string }>

export default async function UserProfile(props: { params: Params }) {
	const params = await props.params
	const id = params.id

	return (
		<div className='container mx-auto bg-base-100 px-4'>
			<UserData userId={id} accessType='PUBLIC' />
			{/* TODO: fetch accessType info. For now, hardcode */}
		</div>
	)
}
