const db = require('../utils/database');

// Get Notifications
const getNotifications = async (req, res) => {
  try {
    const filter = {};
    if (req.query.unread === 'true') {
      filter.read = false;
    }

    const notifications = await db.notifications.find(filter, {
      sort: { createdAt: -1 },
      limit: 30
    });

    const unreadCount = await db.notifications.countDocuments({ read: false });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

// Mark Notification as Read
const markAsRead = async (req, res) => {
  try {
    const notification = await db.notifications.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const updated = await db.notifications.findByIdAndUpdate(req.params.id, { read: true });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating notification' });
  }
};

// Mark All Notifications as Read
const markAllAsRead = async (req, res) => {
  try {
    await db.notifications.updateMany({ read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating notifications' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
