// Be a "dumb component" (purely presentational).
// Display individual post data (e.g., author, content, media, timestamp, etc.).
// Receive all data through props.
import React from 'react'
import ACTIONS from '../containers/PostsContainer'
import { PostProps_type } from '../types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear } from '@fortawesome/free-solid-svg-icons'
export default function Post({ post, dispatch, isOwnPost = false }: PostProps_type) {
	console.log('POST data: ', { ...post, isOwnPost: isOwnPost })
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
