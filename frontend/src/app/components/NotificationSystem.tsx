import React, { useState, useRef, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { Notification } from '../utils/types/notifications';
import NotificationsContainer from '../containers/NotificationsContainer';
import { dummyNotifications } from '../dummyData';

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
    <div className="dropdown dropdown-bottom">
      <label 
        tabIndex={0} 
        className="px-4 py-2"
        onClick={toggleDropdown}
      >
        <span>Notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </label>
      {isDropdownOpen && (
        <NotificationsContainer 
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
        />
      )}
    </div>
  );
  
};

export default NotificationSystem;
