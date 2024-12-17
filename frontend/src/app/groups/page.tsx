'use client'

import { useEffect, useState, useReducer, useRef } from 'react'
import Header from '../components/Header'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { UserBasic_type } from '../utils/types/types'
import DOMPurify from 'dompurify'

const ACTIONS = {
	SET_GROUPS: 'SET_GROUPS',
	CREATE_GROUP: 'CREATE_GROUP',
}

type GroupsState_type = {
	groups: Group_type[]
}

type Group_type = {
	id: number
	name: string
	description: string
	createdAt: string
	creatorId: number
}

type GroupsActions_type =
	| {
			type: typeof ACTIONS.SET_GROUPS
			payload: Group_type[]
	  }
	| { type: typeof ACTIONS.CREATE_GROUP; payload: Group_type }

function reducer(state: GroupsState_type, action: GroupsActions_type): GroupsState_type {
	switch (action.type) {
		case ACTIONS.SET_GROUPS:
			console.log('SET_GROUPS payload', action.payload)
			if (Array.isArray(action.payload)) {
				return { ...state, groups: action.payload }
			} else {
				throw new Error('Invalid payload for SET_POSTS')
			}
		case ACTIONS.CREATE_GROUP:
			console.log('CREATE_GROUP payload', action.payload)
			if (
				typeof action.payload === 'object' &&
				'id' in action.payload &&
				'name' in action.payload &&
				'description' in action.payload &&
				'createdAt' in action.payload &&
				'creator' in action.payload
			) {
				return { ...state, groups: [...state.groups, action.payload] }
			}
		default:
			return state
	}
}

export default function GroupsList() {
	const [state, dispatch] = useReducer(reducer, { groups: [] })
	const [newGroup, setNewGroup] = useState<{ name: string; description: string }>({
		name: '',
		description: '',
	})
	const [loading, setLoading] = useState<boolean>(false)
	const router = useRouter()
	const createGroupRef = useRef<HTMLDialogElement | null>(null)
	const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
	useEffect(() => {
		const fetchGroups = async () => {
			try {
				const response = await axios.get(`${backendUrl}/api/groups`, {
					withCredentials: true,
				})
				console.log('groups', response)
				const modifiedGroups = response.data.map(
					(group: {
						id: number
						name: string
						description: string
						creator_id: number
						created_at: string
						group_members: UserBasic_type[]
					}) => {
						return {
							id: group.id,
							name: group.name,
							description: group.description,
							creatorId: group.creator_id,
							createdAt: group.created_at,
							members: group.group_members,
						}
					},
				)
				// use dummy data until the api is ready
				/* const response = {
					data: [
						{
							id: 1,
							name: 'Group 1',
							description: 'Description 1',
							createdAt: '2023-08-01',
							creator: 4,
						},
						{
							id: 2,
							name: 'Group 2',
							description: 'Description 2',
							createdAt: '2023-08-01',
							creator: 4,
						},
					],
				} */
				dispatch({ type: ACTIONS.SET_GROUPS, payload: modifiedGroups })
			} catch (error) {
				console.log('Error fetching groups', error)
			}
		}
		fetchGroups()
	}, [])

	const handleSubmit = async () => {
		console.log('Sending group data:', {
			name: newGroup.name,
			description: newGroup.description,
		})

		try {
			setLoading(true)
			const response = await axios.post(
				`${backendUrl}/api/groups`,
				{
					group_name: newGroup.name,
					group_description: newGroup.description,
				},
				{
					withCredentials: true,
					headers: {
						'Content-Type': 'application/json',
					},
				},
			)
			console.log('Response:', response)
			dispatch({
				type: ACTIONS.CREATE_GROUP,
				payload: {
					id: response.data.group.id,
					name: response.data.group.name,
					description: response.data.group.description,
					creatorId: response.data.group.creator,
					createdAt: response.data.group.created_at,
				},
			})
			createGroupRef.current?.close()
		} catch (error) {
			console.error('Full error:', error)
		} finally {
			setLoading(false)
		}
	}
	return (
		<div>
			<Header />

			<div className='container pt-16'>
				<div className='flex'>
					{/* Left sidebar with groups */}
					<div className='w-1/3'>
						<div className='bg-white p-6 rounded-lg shadow-sm min-h-screen overflow-y-auto'>
							<div className='flex flex-col'>
								<h1>Groups</h1>
								<button
									className='btn bg-white mb-4 mt-4 w-full'
									onClick={() => createGroupRef.current?.showModal()}
								>
									<FontAwesomeIcon icon={faPlus} />
									Add new group
								</button>
								{state.groups.map((group) => (
									<div
										key={group.id}
										className='card bg-base-100 shadow-sm mb-4 hover:bg-gray-50 cursor-pointer'
										onClick={() => router.push(`/groups/${group.id}`)}
									>
										<div className='card-body'>
											<h2 className='card-title'>{group.name}</h2>
											<p
												dangerouslySetInnerHTML={{
													__html: DOMPurify.sanitize(group.description),
												}}
											></p>

											<div className='card-actions justify-end'></div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
				<dialog id='my_modal_4' ref={createGroupRef} className='modal'>
					<div className='modal-box w-11/12 max-w-5xl'>
						<h3 className='font-bold text-lg'>Create new group</h3>
						<form className='flex flex-col items-center justify-center w-full pt-4'>
							<div
								className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'
								onClick={() => createGroupRef.current?.close()}
							>
								✕
							</div>
							<label className='form-control w-full mb-4'>
								<span className='label-text mb-2'>Name</span>
								<input
									type='text'
									className='input input-bordered w-full'
									value={newGroup.name}
									autoFocus
									spellCheck={false}
									onChange={(e) =>
										setNewGroup({ ...newGroup, name: e.target.value })
									}
								/>
							</label>

							<label className='form-control w-full'>
								<span className='label-text mb-2'>Description</span>
								<textarea
									className='textarea textarea-bordered text-base w-full h-32'
									value={newGroup.description}
									spellCheck={false}
									onChange={(e) =>
										setNewGroup({ ...newGroup, description: e.target.value })
									}
								></textarea>
							</label>
						</form>

						<div className='modal-action'>
							<button
								className='btn'
								disabled={
									loading ||
									newGroup.name.trim() === '' ||
									newGroup.description.trim() === ''
								}
								onClick={() => handleSubmit()}
							>
								SUBMIT
							</button>
						</div>
					</div>
				</dialog>
			</div>
		</div>
	)
}
