import React, { useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { ACTIONS } from '../utils/actions/postActions'
import { PostsAction_type } from '../utils/types'
import axios from 'axios'

function CreateComment({
	postId,
	dispatch,
}: {
	postId: number
	dispatch: (action: PostsAction_type) => void
}) {
	const [comment, setComment] = useState<{ content: string; mediaUrl: string }>({
		content: '',
		mediaUrl: '',
	})
	const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState<boolean | null>(null) // was the new comment added to db successfully?

	// Ref for the textarea
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)

	const handleSubmitComment = async () => {
		try {
			setLoading(true)
			setSuccess(null)
			const response = await axios.post(
				`${backendUrl}/api/posts/${postId}/comments`,
				{
					content: comment.content,
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
					mediaUrl: newComment.mediaUrl || null,
					createdAt: new Date(newComment.created_at),
					author: {
						id: newComment.user_id,
						firstName: 'Annonymous',
						lastName: '',
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
						mediaUrl: newComment.mediaUrl || null,
						createdAt: new Date(newComment.created_at),
						author: {
							id: newComment.user_id,
							firstName: newComment.author?.first_name || 'Annonymous',
							lastName: newComment.author?.last_name || '',
						},
					},
				},
			})
			setSuccess(true)
			setComment({ content: '', mediaUrl: '' }) // Reset comment
			textareaRef.current?.blur() // Programmatically blur the textarea (to cause it to shrink it height)
		} catch (error) {
			console.error('Error submitting comment:', error)
			alert('Failed to add comment. Please try again.')
			setSuccess(false)
		} finally {
			setLoading(false)
		}
	}
	const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setComment({ ...comment, content: e.target.value })
	}

	return (
		<div className='relative'>
			<textarea
				placeholder='Post your comment'
				className='textarea textarea-bordered textarea-xs w-full pt-3  h-8 focus:h-20 transition ease-in-out duration-300 resize-none'
				value={comment.content}
				onChange={(e) => handleCommentChange(e)}
				autoCorrect='off'
				spellCheck='false'
				ref={textareaRef} // Attach the ref to the textarea
			></textarea>
			<button
				className='btn btn-circle btn-outline absolute h-8 w-8 min-h-8 bottom-3.5 right-2'
				onClick={handleSubmitComment}
				onMouseDown={(e) => e.preventDefault()} // Prevent textarea blur on first click
				disabled={loading || !comment.content.trim()}
			>
				<FontAwesomeIcon className='text-base/6' icon={faPaperPlane} />
			</button>
			{success === false && <p className='text-red-500 mt-2'>Failed to add comment.</p>}
		</div>
	)
}

export default CreateComment
