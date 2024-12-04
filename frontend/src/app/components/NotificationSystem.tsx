import React, { useState, useRef, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { Notification } from '../types/notifications';

const formatTimestamp = (date: Date): string => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const dummyNotifications: Notification[] = [
  {
    id: 1,
    message: "John started following you",
    timestamp: formatTimestamp(new Date()),
    type: "follow",
    linkTo: "/profile/john",
    read: false
  },
  {
    id: 2,
    message: "You've been invited to join 'Coding Club' group",
    timestamp: formatTimestamp(new Date(Date.now() - 3600000)),
    type: "group",
    linkTo: "/groups/coding-club",
    read: false
  },
  {
    id: 3,
    message: "Alice commented on your post: 'Great idea!'",
    timestamp: formatTimestamp(new Date(Date.now() - 7200000)),
    type: "comment",
    linkTo: "/posts/123",
    read: false
  },
  {
    id: 4,
    message: "Welcome to the platform! Complete your profile.",
    timestamp: formatTimestamp(new Date(Date.now() - 86400000)),
    type: "follow",
    linkTo: "/profile/settings",
    read: false
  }
];

const NotificationSystem: React.FC = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(dummyNotifications);
  const [unreadCount, setUnreadCount] = useState(dummyNotifications.filter(n => !n.read).length);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const handleNotificationClick = useCallback((notification: Notification) => {
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => prev - 1);
    setIsDropdownOpen(false);
    router.push(notification.linkTo);
  }, [router]);

  return (
    <div className="dropdown dropdown-bottom" ref={dropdownRef}>
      <label 
        tabIndex={0} 
        className="relative inline-flex items-center cursor-pointer px-3 py-2"
        onClick={toggleDropdown}
      >
        <span className="mr-6">Notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </label>
      {isDropdownOpen && (
        <ul className="dropdown-content menu z-50 p-2 shadow-lg bg-base-100 rounded-box w-80 mt-1 max-h-[80vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <li className="p-4 text-gray-500">No notifications</li>
          ) : (
            notifications.map((notification, index) => (
              <li 
                key={`notification-${notification.id}-${index}`}
                onClick={() => handleNotificationClick(notification)}
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
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default NotificationSystem;
