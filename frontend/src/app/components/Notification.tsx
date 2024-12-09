import { Notification as NotificationType } from '../utils/types/notifications'

type NotificationProps = {
  notification: NotificationType
  onClick: () => void
}

const Notification = ({ notification, onClick }: NotificationProps) => {
  const renderActionButtons = () => {
    switch (notification.requestType) {
      case 'friend':
        return (
          <div className="flex gap-4 mt-2 items-center">
            <button className="btn btn-xs btn-success">Accept</button>
            <button className="btn btn-xs btn-ghost">Delete</button>
          </div>
        );
      case 'group':
        return (
          <div className="flex gap-4 mt-2 items-center">
            <button className="btn btn-xs btn-success">Accept</button>
            <button className="btn btn-xs btn-ghost">Delete</button>
          </div>
        );
      case 'event':
        return (
          <div className="flex gap-4 mt-2 items-center">
            <button className="btn btn-xs btn-success">Going</button>
            <button className="btn btn-xs btn-ghost">Not Going</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <li 
      onClick={onClick}
      className="border-b last:border-b-0 hover:bg-base-200 transition-colors duration-200"
    >
      <a className={`flex flex-col gap-1 py-3 ${notification.read ? 'bg-white' : 'bg-blue-50/80'}`}>
        <span className="text-sm">{notification.message}</span>
        <span className="text-xs text-gray-500">
          {notification.timestamp}
        </span>
        {renderActionButtons()}
      </a>
    </li>
  )
}

export default Notification
