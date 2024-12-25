import React from 'react'
import { PostProps_type } from '../utils/types/types'
import CommentsContainer from '../containers/CommentsContainer'
import DOMPurify from 'dompurify'
import SetPostPrivacy from './SetPostPrivacy'
import Image from 'next/image'

export default function Post({ post, dispatch, followers, isOwnPost = false }: PostProps_type) {
	const sanitizedContent = DOMPurify.sanitize(post.content)
	const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
	const uploadsUrl = `${backendUrl}/uploads/`

	return (
		<div className='post card rounded-lg shadow-sm bg-base-100 p-4 mb-4'>
			<div className='flex justify-between items-start mb-4'>
				<div>
					<h2 className='font-bold'>{post.title}</h2>

					<p className='text-sm font-semibold text-primary'>
						{post.author.firstName} {post.author.lastName}
					</p>
					<p className='text-xs text-gray-500'>
						{new Date(post.createdAt).toLocaleString()}
					</p>
				</div>
				{isOwnPost && (
					<SetPostPrivacy
						postId={post.id}
						initialPrivacy={post.privacy}
						initialAllowedUsers={post.allowedUsers || []}
						followers={followers || []}
						dispatch={dispatch}
					/>
				)}
			</div>

			<div className='post-content mb-4'>
				<p
					className='text-sm text-gray-800'
					dangerouslySetInnerHTML={{ __html: sanitizedContent }}
				/>

				{post.mediaUrl && (
					<div className='mt-4'>
						<Image
							src={`${uploadsUrl}${post.mediaUrl}`}
							alt='Attached media'
							className='rounded-lg border border-gray-200 max-w-full'
							width={354}
							height={354}
							priority={false}
						/>
					</div>
				)}
			</div>

			<div className='comments-container mt-4'>
				<CommentsContainer postId={post.id} comments={post.comments} dispatch={dispatch} />
			</div>
		</div>
	)
}
