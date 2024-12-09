import { Notification as NotificationType } from '../utils/types/notifications'
import Notification from '../components/Notification'

type NotificationsContainerProps = {
  notifications: NotificationType[]
  onNotificationClick: (notification: NotificationType) => void
}

const NotificationsContainer = ({ notifications, onNotificationClick }: NotificationsContainerProps) => {
  return (
    <ul className="dropdown-content menu z-50 p-2 shadow-lg rounded-box w-80 mt-1 max-h-[80vh] overflow-y-auto">
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
