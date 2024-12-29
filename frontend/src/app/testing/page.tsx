'use client'

import { FormEvent, useCallback, useState, useEffect, useContext } from 'react'
import { WebSocketContext, channelTypes } from '../components/WsContext'

export default function LoginPage() {
	type EchoMessage = {
		time: string
		text: string
	}

    const channel = channelTypes.echo();
	const [messages, setMessages] = useState<EchoMessage[]>([])

    const [subscribe, send] = useContext(WebSocketContext)
    
    const messageReceived = useCallback((msg: EchoMessage) => {
        setMessages((p) => [...p, msg])
    }, [messages])

    useEffect(() => {
        const unsub = subscribe(channel, ({ data }: { data: EchoMessage }) => messageReceived(data))
        return () => unsub()
    }, [subscribe])

    const onSubmit = async (ev: FormEvent) => {
        ev.preventDefault()
        const form = (ev.target as HTMLFormElement);
        const text = form.text.value;
        const time = (new Date()).toISOString();
        form.reset()
        send("echo", {text, time})
    }

	return (
		<div>
            <h1>echo testing</h1>
            <div>
            {messages.map((msg, idx)=> (
                <p key={idx}>{msg.time}: {msg.text}</p>
            ))}
            </div>
            <form onSubmit={onSubmit}>
                <label>Text: <input type="text" name="text"></input></label>
                <input type='submit' value="Send"/>
            </form>
		</div>
	)
}
