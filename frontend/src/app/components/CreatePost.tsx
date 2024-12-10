import React, { useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faImage, faXmark } from '@fortawesome/free-solid-svg-icons'
import { ACTIONS } from '../utils/actions/postActions'
import { PostsAction_type } from '../utils/types'
import axios from 'axios'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'

function CreatePost() {
	const [newPost, setNewPost] = useState<{ title: string; content: string; media: File | null }>({
		title: '',
		content: '',
		media: null,
	})
	const [imagePreview, setImagePreview] = useState<string | null>(null)
	const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
	const [loading, setLoading] = useState(false)

	const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
	const titleRef = useRef<HTMLInputElement | null>(null)
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)
	const fileInputRef = useRef<HTMLInputElement | null>(null)

	const handleMediaUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0]

			if (file.size > MAX_FILE_SIZE) {
				toast.error('File size exceeds the 5 MB limit. Please upload a smaller image.')
				return
			}

			setNewPost({ ...newPost, media: file })

			// Create a preview URL for the selected file
			const previewUrl = URL.createObjectURL(file)
			setImagePreview(previewUrl)
		}
	}

	const handleRemoveImage = () => {
		setNewPost({ ...newPost, media: null })
		setImagePreview(null)
	}

	const handleTitleChange = (newValue: string) => {
		setNewPost({
			...newPost,
			title: newValue,
		})
	}

	const handleContentChange = (newValue: string) => {
		setNewPost({
			...newPost,
			content: newValue,
		})
	}

	const handleSubmitPost = async () => {
		try {
			setLoading(true)

			const formattedContent = newPost.content.replace(/\n/g, '<br />')

			const formData = new FormData()
			formData.append('content', formattedContent)
			if (newPost.media) {
				formData.append('image', newPost.media)
			}

			console.log('FormData contents:', Array.from(formData.entries()))
			console.log('Request headers:', {
				'Content-Type': 'multipart/form-data',
				withCredentials: true,
			})

			const response = await axios.post(
				`${backendUrl}/api/posts/${postId}/comments`,
				formData,
				{
					withCredentials: true,
					headers: {
						'Content-Type': 'multipart/form-data',
					},
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

			setNewPost({ content: '', media: null }) // Reset comment
			setImagePreview(null) // Remove preview
			textareaRef.current?.blur() // Programmatically blur the textarea (to cause it to shrink it height)
		} catch (error) {
			console.error('Error submitting post:', error)
			toast.error('Failed to add post. Please try again.')
		} finally {
			setLoading(false)
		}

		const handleImageUploadClick = () => {
			fileInputRef.current?.click()
		}
	}

	return (
		<div className='post card rounded-lg shadow-sm bg-base-100 p-4 mb-4'>
			<div className='flex flex-col mb-4 space-y-4 relative'>
				<>
					<Toaster />
				</>
				<input
					type='text'
					placeholder='Title'
					onChange={(e) => handleTitleChange(e.target.value)}
					value={newPost.title}
					className='input input-bordered w-full'
					ref={titleRef}
					spellCheck='false'
				/>
				<textarea
					className='textarea textarea-bordered'
					placeholder='Post content'
					value={newPost.content}
					spellCheck='false'
					ref={textareaRef} // Attach the ref to the textarea
					onChange={(e) => {
						handleContentChange(e.target.value)
					}}
				></textarea>
				{/* Upload Image Button */}
				<button
					type='button'
					className='btn btn-circle btn-outline absolute h-8 w-8 min-h-8 bottom-3.5 right-11 w-7 h-7'
					onClick={handleImageUploadClick}
					disabled={loading || newPost.media !== null}
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
				<button
					className='btn btn-circle btn-outline absolute h-8 w-8 min-h-8 bottom-3.5 right-2'
					onClick={handleSubmitPost}
					onMouseDown={(e) => e.preventDefault()} // Prevent textarea blur on first click
					disabled={loading || !newPost.content.trim()}
				>
					<FontAwesomeIcon className='text-base/6' icon={faPaperPlane} />
				</button>
			</div>
			{/* Image Preview */}
			{imagePreview && (
				<div className='relative mt-4 inline-block'>
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
		</div>
	)
}

export default CreatePost
