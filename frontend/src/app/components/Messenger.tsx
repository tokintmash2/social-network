'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faPaperPlane } from '@fortawesome/free-solid-svg-icons'

export default function Messenger() {
    const [isOpen, setIsOpen] = useState(false)
    const [messageContent, setMessageContent] = useState('')

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isOpen ? (
                <div className="w-80 h-96 bg-white rounded-lg shadow-lg flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-semibold">Messages</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-gray-100 p-1 rounded-full"
                        >
                            <FontAwesomeIcon icon={faXmark} className="w-5 h-5"/>
                        </button>
                    </div>
                    
                    {/* Chat messages container */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="chat chat-start">
                            <div className="chat-image avatar">
                                <div className="w-10 rounded-full">
                                    <img
                                        alt="Tailwind CSS chat bubble component"
                                        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                                </div>
                            </div>
                            <div className="chat-bubble">It was said that you would, destroy the Sith, not join them.</div>
                        </div>

                        <div className="chat chat-start">
                            <div className="chat-image avatar">
                                <div className="w-10 rounded-full">
                                    <img
                                        alt="Tailwind CSS chat bubble component"
                                        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                                </div>
                            </div>
                            <div className="chat-bubble">It was you who would bring balance to the Force</div>
                        </div>

                        <div className="chat chat-start">
                            <div className="chat-image avatar">
                                <div className="w-10 rounded-full">
                                    <img
                                        alt="Tailwind CSS chat bubble component"
                                        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                                </div>
                            </div>
                            <div className="chat-bubble">Not leave it in Darkness</div>
                        </div>
                    </div>

                    {/* Message input area */}
                    <div className="p-4 border-t">
                        <div className="flex gap-2">
                            <textarea 
                                placeholder="Type a message..." 
                                className="textarea textarea-bordered w-full min-h-[40px] resize-none"
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                            />
                            <button
                                className='btn btn-circle btn-outline'
                                disabled={!messageContent.trim()}
                            >
                                <FontAwesomeIcon className='text-base/6' icon={faPaperPlane} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-white px-4 py-2 rounded-t-lg shadow-lg font-semibold hover:bg-gray-50"
                >
                    Messages
                </button>
            )}
        </div>
    )
}
