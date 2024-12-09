'use client'
import { useState } from 'react'
import Notification from './Notification'
import { Notification as NotificationType } from '@/app/types/notifications'

type NotificationsContainerProps = {
  notifications: NotificationType[]
  onNotificationClick: (notification: NotificationType) => void
}

const NotificationsContainer = ({ notifications, onNotificationClick }: NotificationsContainerProps) => {
  return (
    <ul className="dropdown-content menu z-50 p-2 shadow-lg bg-base-100 rounded-box w-80 mt-1 max-h-[80vh] overflow-y-auto">
      {notifications.length === 0 ? (
        <li className="p-4 text-gray-500">No notifications</li>
      ) : (
        notifications.map((notification, index) => (
          <Notification 
            key={`notification-${notification.id}-${index}`}
            notification={notification}
            onClick={() => onNotificationClick(notification)}
          />
        ))
      )}
    </ul>
  )
}

export default NotificationsContainer
