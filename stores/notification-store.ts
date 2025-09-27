import { create } from "zustand"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: Date
  read: boolean
  persistent?: boolean
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number

  // Actions
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  clearRead: () => void

  // Getters
  getUnreadNotifications: () => Notification[]
  getRecentNotifications: (limit?: number) => Notification[]
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notificationData) => {
    const notification: Notification = {
      ...notificationData,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    }

    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))

    // Auto-remove non-persistent notifications after 5 seconds
    if (!notification.persistent) {
      setTimeout(() => {
        get().removeNotification(notification.id)
      }, 5000)
    }
  },

  removeNotification: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      const wasUnread = notification && !notification.read

      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
      }
    }),

  markAsRead: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      const wasUnread = notification && !notification.read

      return {
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
      }
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),

  clearRead: () =>
    set((state) => ({
      notifications: state.notifications.filter((n) => !n.read),
      // unreadCount stays the same since we only removed read notifications
    })),

  getUnreadNotifications: () => get().notifications.filter((n) => !n.read),

  getRecentNotifications: (limit = 10) =>
    get()
      .notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit),
}))
