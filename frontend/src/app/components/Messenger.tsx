import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import useWS, { UseWS } from '../utils/hooks/useWs';

interface Message {
    id: string;
    senderId: number;
    content: string;
}

interface MessagePayload {
    content: string;
    receiverId: number;
}

export default function Messenger({ onClose, receiverID }: { onClose: Function, receiverID: number }) {
    const [isOpen, setIsOpen] = useState(true);
    const [messageContent, setMessageContent] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [subscribe, unsubscribe, send] = useWS();

    // Subscribe to messages on mount
    useEffect(() => {
        const messageHandler = (data: any) => {
            setMessages(prev => [...prev, data]);
        };

        subscribe('new_message', messageHandler);
        return () => unsubscribe('new_message', messageHandler);
    }, [subscribe, unsubscribe]);

    const handleSendMessage = () => {
        if (!messageContent.trim()) return;

        // Create the payload with proper typing
        const payload: MessagePayload = {
            content: messageContent,
            receiverId: receiverID,
        };

        // Send it through WebSocket
        send('send_message', payload);
        setMessageContent('');
    };

    return (
        <div className='fixed bottom-4 right-4 z-50'>
            {isOpen ? (
                <div className='w-80 h-96 bg-white rounded-lg shadow-lg flex flex-col'>
                    <div className='p-4 border-b flex justify-between items-center'>
                        <h3 className='font-semibold'>Messages</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className='hover:bg-gray-100 p-1 rounded-full'
                        >
                            <FontAwesomeIcon icon={faXmark} className='w-5 h-5' />
                        </button>
                    </div>

                    {/* Chat messages container */}
                    <div className='flex-1 overflow-y-auto p-4'>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`chat ${message.senderId === receiverID ? 'chat-start' : 'chat-end'}`}
                            >
                                <div className='chat-image avatar'>
                                    <div className='w-10 rounded-full'>
                                        <img alt='User avatar' src='/default-avatar.png' />
                                    </div>
                                </div>
                                <div className='chat-bubble'>{message.content}</div>
                            </div>
                        ))}
                    </div>

                    {/* Message input area */}
                    <div className='p-4 border-t'>
                        <div className='flex gap-2'>
                            <textarea
                                placeholder='Type a message...'
                                className='textarea textarea-bordered w-full min-h-[40px] resize-none'
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                            />
                            <button
                                className='btn btn-circle btn-outline'
                                disabled={!messageContent.trim()}
                                onClick={handleSendMessage}
                            >
                                <FontAwesomeIcon className='text-base/6' icon={faPaperPlane} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    className='btn btn-circle btn-outline'
                    disabled={!messageContent.trim()}
                    onClick={handleSendMessage}
                >
                    <FontAwesomeIcon className='text-base/6' icon={faPaperPlane} />
                </button>
            )}
        </div>
    );
}