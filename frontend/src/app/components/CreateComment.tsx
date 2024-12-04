import React, { useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faImage, faXmark } from '@fortawesome/free-solid-svg-icons'
import { ACTIONS } from '../utils/actions/postActions'
import { PostsAction_type } from '../utils/types'
import axios from 'axios'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'

function CreateComment({
	postId,
	dispatch,
}: {
	postId: number
	dispatch: (action: PostsAction_type) => void
}) {
	const [comment, setComment] = useState<{ content: string; mediaUrl: File | null }>({
		content: '',
		mediaUrl: null,
	})
	const [imagePreview, setImagePreview] = useState<string | null>(null)
	const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState<boolean | null>(null) // was the new comment added to db successfully?

	const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)
	const fileInputRef = useRef<HTMLInputElement | null>(null)

	const handleMediaUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0]

			if (file.size > MAX_FILE_SIZE) {
				toast.error('File size exceeds the 5 MB limit. Please upload a smaller image.')
				return
			}

			setComment({ ...comment, mediaUrl: file })

			// Create a preview URL for the selected file
			const previewUrl = URL.createObjectURL(file)
			setImagePreview(previewUrl)
		}
	}

	const handleRemoveImage = () => {
		setComment({ ...comment, mediaUrl: null })
		setImagePreview(null)
	}

	const handleSubmitComment = async () => {
		try {
			setLoading(true)
			setSuccess(null)
			const formattedContent = comment.content.replace(/\n/g, '<br />') // Convert new lines to <br>

			const response = await axios.post(
				`${backendUrl}/api/posts/${postId}/comments`,
				{
					content: formattedContent,
					mediaUrl: comment.mediaUrl,
				},
				{
					withCredentials: true,
				},
			)

			const newComment = response.data.comment
			console.log({
				postId,
				comment: {
					id: newComment.id,
					content: newComment.content,
					mediaUrl: newComment.mediaUrl,
					createdAt: new Date(newComment.created_at),
					author: {
						id: newComment.user_id,
						firstName: newComment.author?.firstName || 'Annonymous',
						lastName: newComment.author?.lastName || '',
					},
				},
			})

			console.log('new Comment', newComment)

			dispatch({
				type: ACTIONS.ADD_COMMENT,
				payload: {
					postId,
					comment: {
						id: newComment.id,
						content: newComment.content,
						mediaUrl: newComment.mediaUrl,
						createdAt: new Date(newComment.created_at),
						author: {
							id: newComment.user_id,
							firstName: newComment.author?.firstName || 'Annonymous',
							lastName: newComment.author?.lastName || '',
						},
					},
				},
			})
			setSuccess(true)
			setComment({ content: '', mediaUrl: null }) // Reset comment
			setImagePreview(null) // Remove preview
			textareaRef.current?.blur() // Programmatically blur the textarea (to cause it to shrink it height)
		} catch (error) {
			console.error('Error submitting comment:', error)
			toast.error('Failed to add comment. Please try again.')
			setSuccess(false)
		} finally {
			setLoading(false)
		}
	}
	const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setComment({ ...comment, content: e.target.value })
	}

	const handleImageUploadClick = () => {
		fileInputRef.current?.click()
	}

	return (
		<div className='relative'>
			<>
				<Toaster />
			</>
			<textarea
				placeholder='Post your comment'
				className='textarea textarea-bordered textarea-xs w-full pt-3  h-8 focus:h-20 transition ease-in-out duration-300 resize-none'
				value={comment.content}
				onChange={(e) => handleCommentChange(e)}
				autoCorrect='off'
				spellCheck='false'
				ref={textareaRef} // Attach the ref to the textarea
			></textarea>
			{/* Image Preview */}
			{imagePreview && (
				<div className='relative mt-2 inline-block'>
					<Image
						src={imagePreview}
						alt='Selected'
						width={400}
						height={300}
						className='rounded-lg border border-gray-300'
					/>
					{/* Close Button */}
					<button
						type='button'
						className='absolute -top-3 -right-3 text-slate-300 rounded-full border-2 border-slate-200 w-7 h-7 hover:border-slate-400 hover:text-slate-400'
						onClick={handleRemoveImage}
					>
						<FontAwesomeIcon icon={faXmark} />
					</button>
				</div>
			)}
			{/* Upload Image Button */}
			<button
				type='button'
				className='btn btn-circle btn-outline absolute h-8 w-8 min-h-8 bottom-3.5 right-11 w-7 h-7'
				onClick={handleImageUploadClick}
				disabled={loading || comment.mediaUrl !== null}
			>
				<FontAwesomeIcon className='text-base/6' icon={faImage} />
			</button>

			{/* Hidden File Input */}
			<input
				type='file'
				accept='image/*'
				ref={fileInputRef}
				onChange={handleMediaUrlChange}
				className='hidden'
			/>

			{/* Submit Comment Button */}

			<button
				className='btn btn-circle btn-outline absolute h-8 w-8 min-h-8 bottom-3.5 right-2'
				onClick={handleSubmitComment}
				onMouseDown={(e) => e.preventDefault()} // Prevent textarea blur on first click
				disabled={loading || !comment.content.trim()}
			>
				<FontAwesomeIcon className='text-base/6' icon={faPaperPlane} />
			</button>
			{/* Error Message */}
			{success === false && <p className='text-red-500 mt-2'>Failed to add comment.</p>}
		</div>
	)
}
export default CreateComment
