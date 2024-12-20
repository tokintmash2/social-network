"use client"

import { createContext, PropsWithChildren } from 'react'

import useWS from '../utils/hooks/useWs'

const channelTypes = {
    echo: () => 'echo',
    chat_message: () => 'chat_message',
    online_user: () => 'online_users',
}

const WebSocketContext = createContext<Function[]>([])

function WebSocketProvider({ children }: PropsWithChildren) {
    const [subscribe, unsubscribe, send] = useWS()

    return <WebSocketContext.Provider value={[subscribe, unsubscribe, send]}>
        {children}
    </WebSocketContext.Provider>
}

export { WebSocketContext, WebSocketProvider, channelTypes }