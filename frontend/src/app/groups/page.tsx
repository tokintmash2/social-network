'use client'

import { useState, useRef } from 'react'
import Header from '../components/Header'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { myGroups, availableGroups } from '../dummyData'
import Link from 'next/link'

type Group = {
	id: number
	name: string
	description: string
	memberCount: number
}

export default function GroupsList() {
	const [newGroup, setNewGroup] = useState<{ name: string; description: string }>({
		name: '',
		description: '',
	})
	const [loading, setLoading] = useState<boolean>(false)
	const createGroupRef = useRef<HTMLDialogElement | null>(null)

	return (
		<div>
			<Header />
			<div className='pt-16'>
				<main className='flex'>
					<aside className='w-1/4 h-[calc(100vh-6rem)] min-h-screen bg-base-100 border-r border-gray-200 fixed left-0 overflow-y-auto'>
						<div className='p-6'>
							<div className='mb-8'>
								<div className='flex justify-between items-center mb-4'>
									<h2 className='text-xl font-bold bg-gradient-to-l from-[#687984] to-[#B9D7EA] text-transparent bg-clip-text'>
										My Groups
									</h2>
									<button
										className='btn bg-white'
										onClick={() => createGroupRef.current?.showModal()}
									>
										<FontAwesomeIcon icon={faPlus} />
										Add new group
									</button>
								</div>
								<div className='space-y-4'>
									{myGroups.map((group: Group) => (
										<Link href={`/groups/${group.id}`} key={group.id}>
											<div className='card bg-base-100 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer relative z-10'>
												<h3 className='font-semibold'>{group.name}</h3>
												<p className='text-sm text-gray-600'>
													{group.description}
												</p>
												<p className='text-xs text-gray-500 mt-2'>
													{group.memberCount} members
												</p>
											</div>
										</Link>
									))}
								</div>
							</div>

							<div>
								<h2 className='text-xl font-bold bg-gradient-to-l from-[#687984] to-[#B9D7EA] text-transparent bg-clip-text mb-4'>
									Available Groups
								</h2>
								<div className='space-y-4'>
									{availableGroups.map((group: Group) => (
										<Link href={`/groups/${group.id}`} key={group.id}>
											<div className='card bg-base-100 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer'>
												<h3 className='font-semibold'>{group.name}</h3>
												<p className='text-sm text-gray-600'>
													{group.description}
												</p>
												<p className='text-xs text-gray-500 mt-2'>
													{group.memberCount} members
												</p>
											</div>
										</Link>
									))}
								</div>
							</div>
						</div>
					</aside>
					<section className='w-3/4 ml-[25%] p-6'>
						<h1 className='text-2xl font-bold bg-gradient-to-l from-[#687984] to-[#B9D7EA] text-transparent bg-clip-text mb-6'>
							Groups Feed
						</h1>
						<div className='space-y-4'>{/* Group posts will be displayed here */}</div>
					</section>
				</main>

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
									className='textarea textarea-bordered w-full no-resize h-32'
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
