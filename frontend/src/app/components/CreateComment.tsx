import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'

function CreateComment({ postId, dispatch }: { postId: number; dispatch: unknown }) {
	const [comment, setComment] = useState<{ content: string; mediaUrl: string }>({
		content: '',
		mediaUrl: '',
	})

	const handleSubmitComment = () => {
		console.log('submit comment', comment)
		dispatch(
			type: ACTIONS.ADD_COMMENT,
			payload: {
				postId: post.id,
				commentContent: comment.content, comment_mediaUrl: comment.mediaUrl },)
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
			>
				<FontAwesomeIcon className='text-base/6' icon={faPaperPlane} />
			</button>
		</div>
	)
}

export default CreateComment
