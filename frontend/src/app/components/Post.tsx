import React, { useState } from 'react'
import ACTIONS from '../containers/PostsContainer'
import { PostProps_type } from '../types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear } from '@fortawesome/free-solid-svg-icons'

const followers: { id: number; firstName: string; lastName: string }[] = [
	{ id: 1, firstName: 'John', lastName: 'Doe' },
	{ id: 2, firstName: 'Jane', lastName: 'Smith' },
	{ id: 3, firstName: 'Alice', lastName: 'Johnson' },
]

export default function Post({ post, dispatch, isOwnPost = false }: PostProps_type) {
	console.log('POST data: ', { ...post, isOwnPost: isOwnPost })
	// Local state for allowed users
	const [allowedUsers, setAllowedUsers] = useState<number[]>(post.allowedUsers || [])
	return (
		<div className='post'>
			<div className='flex justify-end'>
				{isOwnPost && (
					<div className='post-actions'>
						<div className='dropdown dropdown-end'>
							<div tabIndex={0} role='button' className='btn btn-sm m-1'>
								<FontAwesomeIcon icon={faGear} />
							</div>
							<ul
								tabIndex={0}
								className='dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow'
							>
								<li>
									<a>Public</a>
								</li>
								<li>
									<a>Private</a>
								</li>
								<li>
									<a>Semi-Private</a>
								</li>
							</ul>
						</div>
					</div>
				)}
			</div>
			<div className='post-content'>{post.content}</div>
		</div>
	)
}
