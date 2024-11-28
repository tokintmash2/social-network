import React from 'react'
import { CommentProps_type } from '../utils/types'

function Comment({ comment }: CommentProps_type) {
	return (
		<div className='comment card rounded-none shadow-sm bg-base-100 p-4 my-2'>
			{/* Comment Header */}
			<div className='flex items-center justify-between mb-2'>
				<div className='flex items-center space-x-2'>
					{/* Author Name */}
					<span className='font-bold text-sm text-primary'>
						{comment.author.firstName} {comment.author.lastName}
					</span>
				</div>
				{/* Timestamp */}
				<span className='text-xs text-gray-500'>
					{new Date(comment.createdAt).toLocaleString()}
				</span>
			</div>

			{/* Comment Content */}
			<p className='text-sm text-gray-800'>{comment.content}</p>

			{/* Media Content (if available) */}
			{comment.mediaUrl && (
				<div className='mt-2'>
					<img
						src={comment.mediaUrl}
						alt='Attached media'
						className='rounded-lg border border-gray-200'
					/>
				</div>
			)}
		</div>
	)
}

export default Comment
