/**
 * Push Notification Service
 * Uses Browser Notification API
 */

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
}

class NotificationService {
  private permission: NotificationPermission = 'default'

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications')
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    const permission = await Notification.requestPermission()
    this.permission = permission
    return permission === 'granted'
  }

  /**
   * Check if notifications are supported and granted
   */
  isSupported(): boolean {
    return 'Notification' in window
  }

  /**
   * Check if permission is granted
   */
  isGranted(): boolean {
    return this.permission === 'granted'
  }

  /**
   * Send a notification
   */
  async send(options: NotificationOptions): Promise<Notification | null> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported')
      return null
    }

    if (!this.isGranted()) {
      const granted = await this.requestPermission()
      if (!granted) {
        return null
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192x192.png',
        badge: options.badge || '/icon-192x192.png',
        tag: options.tag,
        data: options.data,
        requireInteraction: false,
      })

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000)

      return notification
    } catch (error) {
      console.error('Error sending notification:', error)
      return null
    }
  }

  /**
   * Notification for new comment
   */
  async notifyNewComment(userName: string, catchSpecies: string) {
    return this.send({
      title: '💬 Neuer Kommentar',
      body: `${userName} hat deinen ${catchSpecies}-Fang kommentiert`,
      tag: 'comment',
    })
  }

  /**
   * Notification for new like
   */
  async notifyNewLike(userName: string, catchSpecies: string) {
    return this.send({
      title: '❤️ Neuer Like',
      body: `${userName} gefällt dein ${catchSpecies}-Fang`,
      tag: 'like',
    })
  }

  /**
   * Notification for new friend request
   */
  async notifyFriendRequest(userName: string) {
    return this.send({
      title: '👥 Neue Freundschaftsanfrage',
      body: `${userName} möchte mit dir befreundet sein`,
      tag: 'friend_request',
    })
  }

  /**
   * Notification for friend request accepted
   */
  async notifyFriendAccepted(userName: string) {
    return this.send({
      title: '✅ Freundschaftsanfrage angenommen',
      body: `${userName} hat deine Freundschaftsanfrage angenommen`,
      tag: 'friend_accepted',
    })
  }

  /**
   * Notification for new catch from friend
   */
  async notifyFriendCatch(userName: string, species: string, length: number) {
    return this.send({
      title: `🎣 ${userName} hat gefangen!`,
      body: `${species} - ${length} cm`,
      tag: 'friend_catch',
    })
  }

  /**
   * Notification reminder
   */
  async notifyReminder(message: string) {
    return this.send({
      title: '⏰ Erinnerung',
      body: message,
      tag: 'reminder',
    })
  }
}

// Singleton instance
export const notificationService = new NotificationService()

// Helper to check if user wants notifications (stored in localStorage)
export function getNotificationPreference(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('notifications_enabled') === 'true'
}

export function setNotificationPreference(enabled: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem('notifications_enabled', enabled.toString())
}
