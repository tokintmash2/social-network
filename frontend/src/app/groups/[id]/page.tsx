'use client'

import React from 'react'
import { useEffect, useReducer, useRef, useState } from 'react'
import Header from '../../components/Header'
import { formatDateTime } from '../../utils/dateUtils'
import { useParams } from 'next/navigation'
import { useLoggedInUser } from '@/app/context/UserContext'
import axios from 'axios'
import Link from 'next/link'
import DOMPurify from 'dompurify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faCrown } from '@fortawesome/free-solid-svg-icons'

import DatePicker, { registerLocale } from 'react-datepicker'
import { enGB } from 'date-fns/locale/en-GB'
import 'react-datepicker/dist/react-datepicker.css'

import dynamic from 'next/dynamic'
import PostsContainer from '@/app/containers/PostsContainer'
import { ACTIONS } from '../../utils/actions/groupActions'
import {
	GroupState_type,
	GroupActions_type,
	MembershipRole_type,
	UserResponse_type,
	GroupState_default,
} from '../../utils/types/groupTypes'

const Select = dynamic(() => import('react-select'), { ssr: false })

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

		case ACTIONS.SET_USERS:
			if (
				Array.isArray(action.payload) &&
				action.payload.every(
					(user) =>
						'id' in user && 'firstName' in user && 'lastName' in user && 'role' in user,
				)
			) {
				return {
					...state,
					users: action.payload,
				}
			}
		case ACTIONS.TOGGLE_INVITE_MODAL:
			return { ...state, showInviteModal: !state.showInviteModal }

		case ACTIONS.SET_EVENTS:
			if (
				Array.isArray(action.payload) &&
				action.payload.every(
					(event) =>
						'id' in event &&
						'title' in event &&
						'description' in event &&
						'date_time' in event &&
						'group_id' in event &&
						'author' in event &&
						'attendees' in event,
				)
			) {
				console.log('SET_EVENTS payload', action.payload)
				return { ...state, events: action.payload }
			}

		case ACTIONS.TOGGLE_EVENT_RSVP:
			if (
				typeof action.payload === 'object' &&
				'eventId' in action.payload &&
				'attendeeList' in action.payload &&
				typeof action.payload.eventId === 'number' &&
				Array.isArray(action.payload.attendeeList)
			) {
				const { eventId, attendeeList } = action.payload
				const updatedEvents = state.events.map((event) =>
					event.id === eventId ? { ...event, attendees: attendeeList } : event,
				)
				console.log('dispatch | updatedEvents', updatedEvents)
				return {
					...state,
					events: updatedEvents,
				}
			}
			return state

		default:
			return state
	}
}

export default function Group() {
	const params = useParams()
	const id = params.id as string
	const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'

	const [state, dispatch] = useReducer(reducer, GroupState_default)
	const [options, setOptions] = useState([])
	const [selectedOptions, setSelectedOptions] = useState<{ value: number; label: string }[]>([])
	const [newEvent, setNewEvent] = useState<{
		title: string
		description: string
		date_time: Date
	}>({
		title: '',
		description: '',
		date_time: new Date(),
	})

	const { loggedInUser } = useLoggedInUser()

	const inviteModalRef = useRef<HTMLDialogElement | null>(null)
	const createEventRef = useRef<HTMLDialogElement | null>(null)

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
						posts: response.data.group_posts,
					},
				})
			} catch (error) {
				console.log('Error fetching a group', error)
			} finally {
				dispatch({ type: ACTIONS.SET_LOADING, payload: false })
			}
		}

		const fetchEvents = async () => {
			try {
				const response = await axios.get(`${backendUrl}/api/groups/${id}/events`, {
					withCredentials: true,
				})

				console.log('events', response.data)
				if (response.data.success) {
					dispatch({
						type: ACTIONS.SET_EVENTS,
						payload: response.data.events,
					})
				}
			} catch (error) {
				console.log('Error fetching events', error)
			}
		}

		fetchGroup()
		fetchEvents()
	}, [id, backendUrl])
	useEffect(() => {
		console.log('loggedInUser', loggedInUser)
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

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await axios.get(`${backendUrl}/api/users`, {
					withCredentials: true,
				})
				if (response.data.success) {
					const allUsers = response.data.users
					const nonMembers = allUsers.filter(
						(user: UserResponse_type) =>
							user.ID !== loggedInUser?.id &&
							!state.members.some((member) => member.id === user.ID),
					)
					const formattedOptions = nonMembers.map((user: UserResponse_type) => ({
						value: user.ID,
						label: `${user.FirstName} ${user.LastName}`,
					}))
					setOptions(formattedOptions)
					dispatch({ type: ACTIONS.SET_USERS, payload: nonMembers })
				}
			} catch (error) {
				console.error('Error fetching users:', error)
			}
		}

		if (state.members.length > 0 && loggedInUser) {
			fetchUsers()
		}
	}, [state.members, loggedInUser, backendUrl])

	const handleRSVPChange = async (eventId: number) => {
		try {
			const myEvent = state.events.find((e) => e.id === eventId)
			const isAttending = myEvent?.attendees?.some((a) => a.id === loggedInUser?.id)

			const response = isAttending
				? await axios.delete(`${backendUrl}/api/groups/${id}/events/${eventId}/rsvp`, {
						withCredentials: true,
					})
				: await axios.post(
						`${backendUrl}/api/groups/${id}/events/${eventId}/rsvp`,
						{},
						{
							withCredentials: true,
						},
					)
			if (response.data.success && response.data.attendees) {
				dispatch({
					type: ACTIONS.TOGGLE_EVENT_RSVP,
					payload: { eventId, attendeeList: response.data.attendees },
				})
			} else {
				throw new Error('Failed to update RSVP')
			}
		} catch (error) {
			console.error('RSVP update failed:', error)
		}
	}

	const handleSendInvites = async () => {
		if (selectedOptions.length > 0) {
			const invitees = selectedOptions.map((option) => option.value)
			inviteModalRef.current?.close()
			dispatch({ type: ACTIONS.TOGGLE_INVITE_MODAL, payload: false })
			console.log('Invitees:', invitees)
			for (const user_id of invitees) {
				await axios.post(
					`${backendUrl}/api/groups/${id}/members/${user_id}`,
					{},
					{ withCredentials: true },
				)
			}
		}
	}

	const handleCreateEvent = async () => {
		try {
			const eventData = {
				title: newEvent.title.trim(),
				description: newEvent.description.trim().replace(/\n/g, '<br />'),
				date_time: newEvent.date_time,
			}

			// Send POST request to create the event
			const response = await axios.post(`${backendUrl}/api/groups/${id}/events`, eventData, {
				withCredentials: true,
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})

			console.log('handleCreateEvent | response', response)

			if (response.data.success) {
				// Update the state with the new event
				dispatch({
					type: ACTIONS.SET_EVENTS,
					payload: [...state.events, response.data.event],
				})

				// Clear form and close modal
				setNewEvent({ title: '', description: '', date_time: new Date() })
				createEventRef.current?.close()
			}
		} catch (error) {
			console.error('Error creating event:', error)
			alert('Error creating event. Please try again.')
		}
	}

	const getChangeMembershipButtonText = () => {
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

	const handleChangeMembershipButtonClick = async () => {
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

	registerLocale('en-GB', enGB)

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
											onClick={handleChangeMembershipButtonClick}
										>
											{getChangeMembershipButtonText()}
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

				{(state.membershipRole === 'ADMIN' || state.membershipRole === 'MEMBER') &&
					!state.loading && (
						<>
							<div className='mb-4'>
								<div className='flex justify-between'>
									<div>
										<h1 className='text-2xl font-bold text-[#B9D7EA] bg-clip-text mb-6'>
											Members
										</h1>
										<div className='text-sm text-gray-500 mb-4'>
											<span className='font-semibold'>Total members:</span>{' '}
											{
												state.members.filter(
													(m) =>
														m.role === 'member' || m.role === 'admin',
												).length
											}
										</div>
									</div>
									<div>
										<button
											className='btn bg-white'
											onClick={() => {
												inviteModalRef.current?.showModal()
												dispatch({
													type: ACTIONS.TOGGLE_INVITE_MODAL,
													payload: true,
												})
											}}
										>
											<FontAwesomeIcon icon={faPlus} />
											Invite member
										</button>
									</div>
								</div>

								<div className='bg-base-100 p-6 mb-6 rounded-lg'>
									{state.members
										.filter(
											(member) =>
												member.role === 'admin' || member.role === 'member',
										)
										.map((member) => (
											<Link
												key={'member-' + member.id}
												href={`/profile/${member.id}`}
												className='link link-hover mr-2 block'
											>
												{member.firstName} {member.lastName}{' '}
												{member.role === 'admin' && (
													<FontAwesomeIcon icon={faCrown} />
												)}
											</Link>
										))}
								</div>
							</div>

							<div className='mb-4'>
								<div className='flex justify-between'>
									<h1 className='text-2xl font-bold text-[#B9D7EA] bg-clip-text mb-6'>
										Events
									</h1>
									<button
										className='btn bg-white'
										onClick={() => createEventRef.current?.showModal()}
									>
										<FontAwesomeIcon icon={faPlus} />
										Create new event
									</button>
								</div>

								{state.events?.length > 0 &&
									state.events.map((event) => (
										<div
											key={'event-' + event.id}
											className='bg-base-100 p-6 mb-6 rounded-lg'
										>
											<div className='form-control mb-4'>
												<div className='flex items-center justify-end'>
													<span className='text-sm text-gray-600 mr-4'>
														RSVP
													</span>
													<input
														type='checkbox'
														className='toggle toggle-md toggle-accent'
														checked={
															event.attendees?.some(
																(attendee) =>
																	attendee.id ===
																	loggedInUser?.id,
															) || false
														}
														onChange={() => handleRSVPChange(event.id)}
													/>
												</div>
											</div>

											<p>Event title: {event.title}</p>
											<p>
												Event description:{' '}
												<span
													dangerouslySetInnerHTML={{
														__html: DOMPurify.sanitize(
															event.description,
														),
													}}
												></span>
											</p>
											<p>Event date: {formatDateTime(event.date_time)}</p>
											<p>
												Event author: {event.author.firstName}{' '}
												{event.author.lastName}
											</p>
											<p>
												Event attendees:{' '}
												{event.attendees?.length > 0 && (
													<>
														{event.attendees.map((attendee) => (
															<Link
																key={
																	'event-' +
																	event.id +
																	'-attendee-' +
																	attendee.id
																}
																href={`/profile/${attendee.id}`}
																className='link link-hover mr-2 block'
															>
																{attendee.firstName}{' '}
																{attendee.lastName}
															</Link>
														))}
													</>
												)}{' '}
												{!event.attendees && 'No attendees'}
											</p>
										</div>
									))}
							</div>

							<PostsContainer group={true} groupId={Number(id)} />
						</>
					)}

				<dialog ref={inviteModalRef} className='modal'>
					<div className='modal-box w-11/12 max-w-5xl min-h-96'>
						<div
							className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'
							onClick={() => {
								inviteModalRef.current?.close()
								dispatch({ type: ACTIONS.TOGGLE_INVITE_MODAL, payload: false })
							}}
						>
							✕
						</div>
						<h2 className='text-lg font-bold mb-4'>Invite Members</h2>
						<Select
							options={options}
							isMulti={true}
							isSearchable={true}
							onChange={(newValues) =>
								newValues &&
								setSelectedOptions(
									Array.from(newValues as { value: number; label: string }[]),
								)
							}
							instanceId='my-select'
							inputId='my-select-input'
						/>

						<div className='modal-action'>
							<button
								className='btn'
								onClick={handleSendInvites}
								disabled={selectedOptions.length === 0}
							>
								Send Invitation
							</button>
						</div>
					</div>
				</dialog>

				<dialog ref={createEventRef} className='modal'>
					<div className='modal-box w-11/12 max-w-5xl min-h-96'>
						<div
							className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'
							onClick={() => {
								createEventRef.current?.close()
							}}
						>
							✕
						</div>
						<h2 className='text-lg font-bold mb-4'>Add event</h2>
						<form className='flex flex-col items-center justify-center w-full pt-4'>
							<div
								className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'
								onClick={() => createEventRef.current?.close()}
							>
								✕
							</div>
							<label className='form-control w-full mb-4'>
								<span className='label-text mb-2'>Title</span>
								<input
									type='text'
									className='input input-bordered w-full'
									value={newEvent.title}
									autoFocus
									spellCheck={false}
									onChange={(e) =>
										setNewEvent({ ...newEvent, title: e.target.value })
									}
								/>
							</label>

							<label className='form-control w-full  mb-4'>
								<span className='label-text mb-2'>Description</span>
								<textarea
									className='textarea textarea-bordered text-base w-full h-32'
									value={newEvent.description}
									spellCheck={false}
									onChange={(e) =>
										setNewEvent({ ...newEvent, description: e.target.value })
									}
								></textarea>
							</label>

							<label className='form-control w-full'>
								<span className='label-text text-xs mb-0.5 text-[#8DABC2] font-light'>
									Start time
								</span>
								<DatePicker
									selected={newEvent.date_time}
									className='input input-bordered w-full'
									dateFormat='dd/MM/yyyy HH:mm'
									showTimeSelect
									timeIntervals={15}
									timeCaption='Time'
									onChange={(date: Date | null) => {
										if (date) {
											console.log('new date', date)
											setNewEvent({
												...newEvent,
												date_time: date,
											})
										}
									}}
								/>
							</label>
						</form>

						<div className='modal-action'>
							<button
								className='btn'
								disabled={
									newEvent.title.trim() === '' ||
									newEvent.description.trim() === ''
								}
								onClick={() => handleCreateEvent()}
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
