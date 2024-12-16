import { MutableRefObject, useEffect, useRef } from 'react'

type Channel = {
    [key: string]: Function,
}

function useWS() {
    const ws: MutableRefObject<WebSocket | null> = useRef(null)
    const channels: MutableRefObject<Channel> = useRef({})

    const subscribe = (channel: string, callback: Function) => {
        channels.current[channel] = callback
    }

    const unsubscribe = (channel: string) => {
        delete channels.current[channel]
    }

    const send = (action: string, data: any) => {
        const payload = {
            action: action,
            data: data,
            request_id: Math.random().toString()
        }
        console.log("should send to websocket:", payload);

        ws.current?.send(JSON.stringify(payload))
    }

    // FOR DEBUGGING IN DEVTOOLS
    // @ts-ignore
    globalThis.ws = { send, subscribe, unsubscribe };

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8080/ws")
        ws.current.onopen = () => { console.log('WS open') }
        ws.current.onclose = () => { console.log('WS close') }
        ws.current.onerror = (ev) => { console.warn('WS error', ev) }
        ws.current.onmessage = (message) => {
            const { response_to, request_id, ...data } = JSON.parse(message.data);
            console.log("Got WS message:", response_to, request_id, data);
            channels.current[response_to]?.(data)
        }
        return () => { ws.current?.close() }
    })

    return [ subscribe, unsubscribe, send ]
}

export default useWS