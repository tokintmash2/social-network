import { MutableRefObject, useEffect, useRef } from 'react'

function useWS() {
    const ws: MutableRefObject<WebSocket | null> = useRef(null)
    const channels: MutableRefObject<EventTarget> = useRef(new EventTarget())

    const subscribe = (channel: string, callback: (data: unknown) => void) => {
        const listener = (ev: Event) => { callback((ev as CustomEvent).detail) }
        channels.current.addEventListener(channel, listener)
        return () => channels.current.removeEventListener(channel, listener)
    }

    const send = (action: string, data: unknown) => {
        const payload = {
            action: action,
            data: data,
            request_id: Math.random().toString()
        }
        console.log("should send to websocket:", payload);

        ws.current?.send(JSON.stringify(payload))
    }

    const connect = () => {
        if (ws.current && ws.current.readyState == WebSocket.OPEN) {
            return
        }
        ws.current = new WebSocket("ws://localhost:8080/ws")
        ws.current.onopen = () => { console.log('WS open') }
        ws.current.onclose = () => { console.log('WS close') }
        ws.current.onerror = (ev) => { console.warn('WS error', ev) }
        ws.current.onmessage = (message) => {
            const { response_to, request_id, ...data } = JSON.parse(message.data);
            console.log("Got WS message:", response_to, request_id, data);
            channels.current.dispatchEvent(new CustomEvent(response_to, { detail: data }))
        }
    }

    useEffect(() => {
        connect()
        return () => {
            ws.current?.close()
        }
    })

    return { subscribe, send, connect }
}

export default useWS