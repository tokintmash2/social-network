'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

export default function UsersList() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Desktop version */}
            <div className="fixed right-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white shadow-lg overflow-y-auto max-[720px]:hidden">
                <div className="p-4 border-b">
                    <h3 className="font-semibold">Online Users</h3>
                </div>
                <div className="overflow-y-auto h-full">
                    <div className="p-4 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <span>User Name</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile version */}
            <div className="hidden max-[720px]:block">
                {isOpen ? (
                    <div className="fixed bottom-4 right-20 w-80 h-96 bg-white rounded-lg shadow-lg z-50">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-semibold">Online Users</h3>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-gray-100 p-1 rounded-full"
                            >
                                <FontAwesomeIcon icon={faXmark} className="w-5 h-5"/>
                            </button>
                        </div>
                        <div className="overflow-y-auto h-full">
                            <div className="p-4 hover:bg-gray-50 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                    <span>User Name</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-4 right-28 bg-white px-4 py-2 rounded-t-lg shadow-lg font-semibold hover:bg-gray-50"
                    >
                        Users
                    </button>
                )}
            </div>
        </>
    )
}
