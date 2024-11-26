// Be a "dumb component" (purely presentational).
// Display individual post data (e.g., author, content, media, timestamp, etc.).
// Receive all data through props.
import React from 'react'
import ACTIONS from '../containers/PostsContainer'
import { Post_type, PostsAction_type } from '../types'

export default function Post({
	post,
	dispatch,
}: {
	post: Post_type
	dispatch: (action: PostsAction_type) => void
}) {
	return <div>{post.content}</div>
}
