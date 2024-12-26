'use client'
import { useState } from 'react'
import Messenger from './Messenger'

export function ChatContainer({
	activeChats,
	setActiveChats,
}: {
	activeChats: number[]
	setActiveChats: Function
}) {
	const closeChat = (id: number) => {
		console.log('Close chat with:', id)
		const s = new Set([...activeChats])
		s.delete(id)
		setActiveChats(Array.from(s.values()))
	}

	return (
		<div>
			{activeChats.map((id) => (
				<Messenger onClose={closeChat} receiverID={id} key={String(id)} />
			))}
		</div>
	)
}
