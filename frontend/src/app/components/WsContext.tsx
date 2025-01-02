"use client"

import { createContext, PropsWithChildren } from 'react'

import useWS from '../utils/hooks/useWs'

const channelTypes = {
    echo: () => 'echo',
    chat_message: () => 'chat_message',
    group_message: () => 'group_message',
    online_user: () => 'online_users',
    notification: () => 'notification',
}

interface WebSocketContextType {
    subscribe: (channel: string, callback: (data: unknown) => void) => () => void;
    send: (action: string, data: unknown) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

function WebSocketProvider({ children }: PropsWithChildren) {
    const { subscribe, send } = useWS()

    return <WebSocketContext.Provider value={{subscribe, send}}>
        {children}
    </WebSocketContext.Provider>
}

export { WebSocketContext, WebSocketProvider, channelTypes }