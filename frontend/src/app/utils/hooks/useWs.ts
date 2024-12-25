import { MutableRefObject, useEffect, useRef } from 'react'

interface MessagePayload {
    content: string;
    receiverId: number;
}

type Channel = {
    [key: string]: Function
}

export type UseWS = () => [
    (event: string, handler: (data: any) => void) => void, // subscribe
    (event: string, handler: (data: any) => void) => void, // unsubscribe
    (event: string, payload: MessagePayload) => void       // send
];

const useWS: UseWS = () => {
    const ws: MutableRefObject<WebSocket | null> = useRef(null)
    const channels: MutableRefObject<Channel> = useRef({})

    const subscribe = (channel: string, callback: Function) => {
        channels.current[channel] = callback
    }

    const unsubscribe = (channel: string, callback: Function) => {
        if (channels.current[channel] === callback) {
            delete channels.current[channel]
        }
    }

    const send = (action: string, data: MessagePayload) => {
        const payload = {
            action: action,
            data: data,
            request_id: Math.random().toString(),
        }
        console.log('should send to websocket:', payload)
        ws.current?.send(JSON.stringify(payload))
    }

    // FOR DEBUGGING IN DEVTOOLS
    // @ts-ignore
    globalThis.ws = { send, subscribe, unsubscribe }

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8080/ws')

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data)
            const { action, data } = message
            if (channels.current[action]) {
                channels.current[action](data)
            }
        }

        return () => {
            ws.current?.close()
        }
    }, [])

    return [subscribe, unsubscribe, send]
}

export default useWS