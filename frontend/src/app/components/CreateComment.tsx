import React, { useState } from 'react'
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

	const handleSubmitComment = async () => {
		console.log('submit comment', comment)

		try {
			setLoading(true)
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
		} catch (error) {
			console.error('Error submitting comment:', error)
			alert('Failed to add comment. Please try again.')
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
				className='textarea textarea-bordered textarea-xs w-full focus:h-20 transition ease-in-out duration-300'
				value={comment.content}
				onChange={(e) => handleCommentChange(e)}
				autoCorrect='off'
				spellCheck='false'
			></textarea>
			<button
				className='btn btn-circle btn-outline absolute h-8 w-8 min-h-8 bottom-2 right-2'
				onClick={handleSubmitComment}
				disabled={loading || !comment.content.trim()}
			>
				<FontAwesomeIcon className='text-base/6' icon={faPaperPlane} />
			</button>
		</div>
	)
}

export default CreateComment
