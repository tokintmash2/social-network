import React, { useState } from 'react'
import { CommentsContainerProps_type } from '../utils/types/types'
import Comment from '../components/Comment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import CreateComment from '../components/CreateComment'

function CommentsContainer({
	postId,
	comments,
	group = false,
	groupId = undefined,
	dispatch,
}: CommentsContainerProps_type) {
	const [showComments, setShowComments] = useState(false)

	const handleToggleShowComments = () => {
		setShowComments(!showComments)
	}
	return (
		<>
			<CreateComment postId={postId} group={group} groupId={groupId} dispatch={dispatch} />
			<div className='link link-hover' onClick={handleToggleShowComments}>
				{showComments ? (
					<FontAwesomeIcon icon={faAngleUp} />
				) : (
					<FontAwesomeIcon icon={faAngleDown} />
				)}{' '}
				{comments?.length} {!comments && '0'}{' '}
				{comments?.length === 1 ? 'comment' : 'comments'}
			</div>

			{showComments &&
				comments?.length > 0 &&
				comments.map((comment) => <Comment key={comment.id} comment={comment} />)}
		</>
	)
}
export default CommentsContainer
