import React, { useState } from 'react'
import { PostsAction_type } from '../utils/types'
import { dummyFollowers } from '../dummyData'
import Select from 'react-select'


type PrivacyOption_type = { value: 'PUBLIC' | 'PRIVATE' | 'ALMOST_PRIVATE'; label: string };
type AlloerdUserOption_type = { value: string; label: string;}

const privacyOptions: PrivacyOption_type[] = [
    { value: 'PUBLIC', label: 'Public' },
    { value: 'PRIVATE', label: 'Private' },
    { value: 'ALMOST_PRIVATE', label: 'Almost private' },
]

function SetPostPrivacy({ 
    postId,
    initialPrivacy = 'PUBLIC',
    dispatch 
}: {
    postId?: number
    initialPrivacy: PrivacyOption_type
    action: PostsAction_type) => void
} {
	const [allowedUsers, setAllowedUsers] = useState<number[]>(post.allowedUsers || [])
	const [showAllowedUsersSelection, setShowAllowedUsersSelection] = useState(false)
	const [followers, setFollowers] = useState<
		{ id: number; firstName: string; lastName: string }[] | null
	>(null)

	

	return <div>SetPostPrivacy</div>
}

export default SetPostPrivacy
