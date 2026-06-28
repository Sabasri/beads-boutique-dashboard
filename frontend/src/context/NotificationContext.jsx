import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestAlert, setLatestAlert] = useState(null); // Banner alert for new items
  const { isAuthenticated } = useAuth();
  const pollingInterval = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      
      // Check if there are new unread notifications compared to current state
      // If yes, we can trigger a banner alert for the absolute newest one
      if (notifications.length > 0 && data.notifications.length > 0) {
        const currentIds = new Set(notifications.map(n => n._id));
        const newUnread = data.notifications.filter(n => !n.read && !currentIds.has(n._id));
        
        if (newUnread.length > 0) {
          // Trigger banner alert for the newest one
          setLatestAlert(newUnread[0]);
          // Auto-dismiss banner after 5 seconds
          setTimeout(() => setLatestAlert(null), 5000);
        }
      }

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err.message);
    }
  };

  // Start polling when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Poll every 15 seconds
      pollingInterval.current = setInterval(fetchNotifications, 15000);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [isAuthenticated]);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err.message);
    }
  };

  // A function to trigger a simulated notification locally (for demo purposes)
  const triggerLocalNotification = (type, message) => {
    const mockNotification = {
      _id: 'local_' + Math.random().toString(),
      type,
      message,
      read: false,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [mockNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setLatestAlert(mockNotification);
    setTimeout(() => setLatestAlert(null), 5000);
  };

  const value = {
    notifications,
    unreadCount,
    latestAlert,
    dismissAlert: () => setLatestAlert(null),
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    triggerLocalNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
