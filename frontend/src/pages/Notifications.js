import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ComplaintList.css';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('nirapod_identifier');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    if (!userId) {
      setError('Please log in to view notifications');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`/api/notifications/user/${userId}`);
      setNotifications(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch notifications');
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.relatedPostId) {
      // Navigate to comment page for all notifications
      navigate(`/comments/${notification.relatedPostId}`, {
        state: { fromNotification: true }
      });
    }
  };

  const getNotificationStyle = (notification) => {
    let className = 'notification-item';
    if (!notification.read) className += ' notification-unread';

    // Add type-specific classes
    if (notification.message.includes('commented on')) {
      className += ' notification-comment';
    } else if (notification.message.includes('following')) {
      className += ' notification-follow';
    } else if (notification.message.includes('updated')) {
      className += ' notification-update';
    } else {
      className += ' notification-default';
    }

    return className;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 24 hours ago
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      if (hours < 1) {
        const minutes = Math.floor(diff / (60 * 1000));
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Less than 7 days ago
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    
    // Otherwise return the date
    return date.toLocaleDateString();
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="complaint-list-container">
      <h2 className="page-title">Notifications</h2>
      {notifications.length === 0 && (
        <div className="empty-state">
          No notifications yet
        </div>
      )}
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={getNotificationStyle(notification)}
          onClick={() => handleClick(notification)}
        >
          <div className="notification-message">{notification.message}</div>
          <div className="notification-time">{formatTime(notification.createdAt)}</div>
        </div>
      ))}
    </div>
  );
}

export default Notifications;
