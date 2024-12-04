import React, { useState, useEffect, useRef, useCallback } from "react";
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
    read: true
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
  const [wsConnected, setWsConnected] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket('ws://localhost:8080/ws');

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setWsConnected(false);
      setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      ws.close();
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connectWebSocket();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [connectWebSocket]);

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
          {!wsConnected && (
            <li className="p-2 text-sm text-yellow-600 bg-yellow-50 rounded">
              Connecting to notification service...
            </li>
          )}
          {notifications.length === 0 ? (
            <li className="p-4 text-gray-500">No notifications</li>
          ) : (
            notifications.map((notification, index) => (
              <li 
                key={`notification-${notification.id}-${index}`}
                onClick={() => handleNotificationClick(notification)}
                className={`border-b last:border-b-0 hover:bg-base-200 transition-colors
                  ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
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
