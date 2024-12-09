import { Notification as NotificationType } from '@/app/types/notifications'

type NotificationProps = {
  notification: NotificationType
  onClick: () => void
}

const Notification = ({ notification, onClick }: NotificationProps) => {
  return (
    <li 
      onClick={onClick}
      className={`border-b last:border-b-0 hover:bg-base-200 transition-colors duration-200
        ${notification.read ? 'bg-white' : 'bg-blue-50/80'}`}
    >
      <a className="flex flex-col gap-1 py-3">
        <span className="text-sm">{notification.message}</span>
        <span className="text-xs text-gray-500">
          {notification.timestamp}
        </span>
      </a>
    </li>
  )
}

export default Notification
