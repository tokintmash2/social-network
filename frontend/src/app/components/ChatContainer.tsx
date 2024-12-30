'use client'

import Messenger from './Messenger'
import GroupMessenger from './GroupMessenger'
import { ActiveChat } from './SocialFeatures'

export function ChatContainer({
	activeChats,
	setActiveChats,
}: {
	activeChats: ActiveChat[]
	setActiveChats: (chats: ActiveChat[]) => void
}) {
	const closeChat = (type: string, id: number) => {
		console.log('Close chat with:', id)
		const chats = activeChats.filter((item) => !(item.type == type && item.id == id))
		setActiveChats(chats)
	}

	return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-4">
            {activeChats.map((chat) => (
                chat.type == "user" ? (
                    <Messenger 
                        key={`chat-${chat.id}`}
                        onClose={(id: number) => closeChat("user", id)}
                        receiverID={chat.id}
                    />
                ) : (
                    <GroupMessenger
                        key={`groupchat-${chat.id}`}
                        onClose={(id: number) => closeChat("group", id)}
                        groupID={chat.id}
                    />
                )
            ))}
        </div>
    )
}
