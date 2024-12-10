'use client'

import Header from '../../components/Header'
import { useParams } from 'next/navigation'

export default function Group() {
	const params = useParams()
	const id = params.id as string

	return (
		<>
			<Header />
			<div className='container mx-auto'>Display here group with id {id}</div>
		</>
	)
}
