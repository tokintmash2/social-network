'use client'

import { useEffect, useReducer } from 'react'
import Header from '../../components/Header'
import { useParams } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import DOMPurify from 'dompurify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

const ACTIONS = {
	SET_GROUP: 'SET_GROUP',
	SET_GROUP_MEMBERSHIP: 'SET_GROUP_MEMBERSHIP',

	SET_LOADING: 'SET_LOADING',

	SET_EVENT: 'SET_EVENT',
	CREATE_EVENT: 'CREATE_EVENT',
	RSVP: 'RSVP',
}

type Group_type = {
	id: number
	name: string
	description: string
	createdAt: string
	creatorId: number
	members: { id: number; firstName: string; lastName: string }[]
}

type GroupState_type = {
	id: number
	name: string
	description: string
	createdAt: string
	creator: number
	members: { id: number; firstName: string; lastName: string }[]
	membershipStatus: MembershipStatus_type
	loading: boolean
}

const GroupState_default: GroupState_type = {
	id: 0,
	name: '',
	description: '',
	createdAt: '',
	creator: 0,
	members: [],
	membershipStatus: 'NOT_MEMBER',
	loading: true,
}

type MembershipStatus_type = 'MEMBER' | 'PENDING' | 'NOT_MEMBER' | 'ADMIN'
type GroupActions_type =
	| {
			type: typeof ACTIONS.SET_GROUP
			payload: Group_type
	  }
	| {
			type: typeof ACTIONS.SET_GROUP_MEMBERSHIP
			payload: MembershipStatus_type
	  }
	| {
			type: typeof ACTIONS.SET_LOADING
			payload: boolean
	  }

function reducer(state: GroupState_type, action: GroupActions_type): GroupState_type {
	switch (action.type) {
		case ACTIONS.SET_GROUP:
			console.log('SET_GROUP payload', action.payload)
			if (
				action.payload &&
				typeof action.payload === 'object' &&
				'id' in action.payload &&
				'name' in action.payload &&
				'description' in action.payload &&
				'createdAt' in action.payload &&
				'members' in action.payload &&
				'creatorId' in action.payload
			)
				return {
					...state,
					...action.payload,
				}
		case ACTIONS.SET_LOADING:
			if (typeof action.payload === 'boolean') {
				return {
					...state,
					loading: action.payload,
				}
			} else {
				throw new Error('Invalid payload for SET_LOADING')
			}
		case ACTIONS.SET_GROUP_MEMBERSHIP:
			return {
				...state,
			}
		default:
			return state
	}
}

export default function Group() {
	const params = useParams()
	const id = params.id as string
	const [state, dispatch] = useReducer(reducer, GroupState_default)
	const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
	useEffect(() => {
		const fetchGroup = async () => {
			try {
				dispatch({ type: ACTIONS.SET_LOADING, payload: true })
				const response = await axios.get(`${backendUrl}/api/groups/${id}`, {
					withCredentials: true,
				})
				console.log('response', response.data)
				dispatch({
					type: ACTIONS.SET_GROUP,
					payload: {
						id: response.data.id,
						name: response.data.name,
						description: response.data.description,
						createdAt: response.data.created_at,
						creatorId: response.data.creator_id,
						members: response.data.group_members,
					},
				})
			} catch (error) {
				console.log('Error fetching a group', error)
			} finally {
				dispatch({ type: ACTIONS.SET_LOADING, payload: false })
			}
		}
		fetchGroup()
	}, [id, backendUrl])
	return (
		<div>
			<Header />
			<div className='container mx-auto pt-16'>
				<div className='bg-base-100 p-6 mb-6 rounded-br-lg rounded-bl-lg pt-24'>
					<div className='flex flex-col mb-6'>
						{state.loading ? (
							<div>Loading...</div>
						) : (
							<>
								<div className='flex justify-end mb-6'>
									<button className='btn btn-outline btn-sm'>Join</button>
								</div>
								<div>Group name: {state.name}</div>
								<div>
									Group description:{' '}
									<span
										dangerouslySetInnerHTML={{
											__html: DOMPurify.sanitize(state.description),
										}}
									></span>
								</div>
							</>
						)}
					</div>
				</div>

				<div className='mb-4'>
					<div className='flex justify-between'>
						<div>
							<h1 className='text-2xl font-bold text-primary mb-4'>Members</h1>
							<div className='text-sm text-gray-500 mb-4'>
								<span className='font-semibold'>Total members:</span>{' '}
								{state.members.length}
							</div>
						</div>
						<div>
							<button className='btn bg-white'>
								<FontAwesomeIcon icon={faPlus} />
								Add member
							</button>
						</div>
					</div>

					<div className='bg-base-100 p-6 mb-6 rounded-lg'>
						{state.members.map((member) => (
							<Link
								key={'member-' + member.id}
								href={`/profile/${member.id}`}
								className='link link-hover mr-2'
							>
								{member.firstName} {member.lastName}
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
