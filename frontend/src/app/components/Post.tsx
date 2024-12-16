import React from 'react'
import { PostProps_type } from '../utils/types/types'
import CommentsContainer from '../containers/CommentsContainer'
import DOMPurify from 'dompurify'
import SetPostPrivacy from './SetPostPrivacy'

export default function Post({ post, dispatch, followers, isOwnPost = false }: PostProps_type) {
	const sanitizedContent = DOMPurify.sanitize(post.content)

	return (
		<div className='post card rounded-lg shadow-sm bg-base-100 p-4 mb-4'>
			{isOwnPost && (
				<div className='flex justify-end'>
					<SetPostPrivacy
						postId={post.id}
						initialPrivacy={post.privacy}
						initialAllowedUsers={post.allowedUsers || []}
						followers={followers || []}
						dispatch={dispatch}
					/>
				</div>
			)}
			<div className='flex justify-between items-start mb-4'>
				<h2 className='font-bold'>{post.title}</h2>
				<div className='text-right'>
					<p className='text-sm font-semibold text-primary'>
						{post.author.firstName} {post.author.lastName}
					</p>
					<p className='text-xs text-gray-500'>
						{new Date(post.createdAt).toLocaleString()}
					</p>
				</div>
			</div>

			<div className='post-content mb-4'>
				<p
					className='text-sm text-gray-800'
					dangerouslySetInnerHTML={{ __html: sanitizedContent }}
				/>

				{post.mediaUrl && (
					<div className='mt-4'>
						<img
							src={post.mediaUrl}
							alt='Attached media'
							className='rounded-lg border border-gray-200 max-w-full'
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
