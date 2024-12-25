import React from 'react'
import { CommentProps_type } from '../utils/types/types'
import DOMPurify from 'dompurify'
import Image from 'next/image'

function Comment({ comment }: CommentProps_type) {
	// Sanitize the HTML content to prevent XSS attacks
	const sanitizedContent = DOMPurify.sanitize(comment.content)
	const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
	const uploadsUrl = `${backendUrl}/uploads/`
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
			<p
				className='text-sm text-gray-800'
				dangerouslySetInnerHTML={{ __html: sanitizedContent }}
			/>

			{/* Media Content (if available) */}
			{comment.mediaUrl && (
				<div className='mt-2'>
					<Image
						src={`${uploadsUrl}${comment.mediaUrl}`}
						alt='Attached media'
						className='rounded-lg border border-gray-200 max-w-full'
						width={354}
						height={354}
						priority={false}
					/>
				</div>
			)}
		</div>
	)
}

export default Comment
