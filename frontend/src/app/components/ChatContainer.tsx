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
        <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-4">
            {activeChats.map((id, index) => (
                <Messenger 
                    key={`chat-${id}`}
                    onClose={closeChat}
                    receiverID={id}
                    chatIndex={index}
                />
            ))}
        </div>
    )
}
