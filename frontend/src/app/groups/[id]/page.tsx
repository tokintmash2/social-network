'use client'

import { useEffect, useReducer } from 'react'
import Header from '../../components/Header'
import { useParams } from 'next/navigation'
import { useLoggedInUser } from '@/app/context/UserContext'
import axios from 'axios'
import Link from 'next/link'
import DOMPurify from 'dompurify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

const ACTIONS = {
	SET_GROUP: 'SET_GROUP',
	SET_GROUP_MEMBERSHIP_ROLE: 'SET_GROUP_MEMBERSHIP_ROLE',

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
	members: { id: number; firstName: string; lastName: string; role: string }[]
}

type GroupState_type = {
	id: Group_type['id']
	name: Group_type['name']
	description: Group_type['description']
	createdAt: Group_type['createdAt']
	creatorId: Group_type['creatorId']
	members: Group_type['members']
	membershipRole: MembershipRole_type
	loading: boolean
}

const GroupState_default: GroupState_type = {
	id: 0,
	name: '',
	description: '',
	createdAt: '',
	creatorId: 0,
	members: [],
	membershipRole: 'NOT_MEMBER',
	loading: true,
}

type MembershipRole_type = 'NOT_MEMBER' | 'PENDING' | 'MEMBER' | 'ADMIN'
type GroupActions_type =
	| {
			type: typeof ACTIONS.SET_GROUP
			payload: Group_type
	  }
	| {
			type: typeof ACTIONS.SET_GROUP_MEMBERSHIP_ROLE
			payload: MembershipRole_type
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
		case ACTIONS.SET_GROUP_MEMBERSHIP_ROLE:
			if (
				action.payload === 'NOT_MEMBER' ||
				action.payload === 'PENDING' ||
				action.payload === 'MEMBER' ||
				action.payload === 'ADMIN'
			) {
				return {
					...state,
					membershipRole: action.payload,
				}
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
	const { loggedInUser } = useLoggedInUser()
	useEffect(() => {
		const fetchGroup = async () => {
			try {
				dispatch({ type: ACTIONS.SET_LOADING, payload: true })
				const response = await axios.get(`${backendUrl}/api/groups/${id}`, {
					withCredentials: true,
				})
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
	useEffect(() => {
		if (loggedInUser) {
			const member = state.members.find((m) => m.id === loggedInUser.id)
			if (member) {
				const role = member.role.toUpperCase()
				dispatch({
					type: ACTIONS.SET_GROUP_MEMBERSHIP_ROLE,
					payload: role as MembershipRole_type,
				})
			} else {
				dispatch({
					type: ACTIONS.SET_GROUP_MEMBERSHIP_ROLE,
					payload: 'NOT_MEMBER' as MembershipRole_type,
				})
			}
		}
	}, [loggedInUser, state.members])

	const getButtonText = () => {
		switch (state.membershipRole) {
			case 'ADMIN':
				return ''
			case 'MEMBER':
				return 'Leave'
			case 'PENDING':
				return 'Cancel Request to Join'
			case 'NOT_MEMBER':
			default:
				return 'Join'
		}
	}

	const handleButtonClick = async () => {
		switch (state.membershipRole) {
			case 'MEMBER':
			case 'PENDING':
				// Leave group logic
				try {
					const response = await axios.delete(
						`${backendUrl}/api/groups/${id}/members/${loggedInUser?.id}`,
						{
							withCredentials: true,
						},
					)
					console.log(response)
					if (response.data.success) {
						dispatch({
							type: ACTIONS.SET_GROUP_MEMBERSHIP_ROLE,
							payload: 'NOT_MEMBER',
						})
					}
				} catch (error) {
					console.log('Error leaving a group', error)
				}
				break

			case 'NOT_MEMBER':
				// Join group logic
				try {
					const response = await axios.post(
						`${backendUrl}/api/groups/${id}/members/${loggedInUser?.id}`,
						null,
						{ withCredentials: true },
					)
					console.log(response)
					if (response.data.success) {
						dispatch({
							type: ACTIONS.SET_GROUP_MEMBERSHIP_ROLE,
							payload: 'PENDING',
						})
					}
				} catch (error) {
					console.log('Error joing a group', error)
				}
				break
		}
	}

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
									{state.membershipRole !== 'ADMIN' && (
										<button
											className='btn btn-outline btn-sm'
											onClick={handleButtonClick}
										>
											{getButtonText()}
										</button>
									)}
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
