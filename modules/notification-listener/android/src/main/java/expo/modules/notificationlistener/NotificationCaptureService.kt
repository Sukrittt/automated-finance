package expo.modules.notificationlistener

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class NotificationCaptureService : NotificationListenerService() {
  override fun onNotificationPosted(sbn: StatusBarNotification) {
    val extras = sbn.notification.extras
    val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()
    val body = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()

    NotificationEventStore.lastEvent = NotificationEvent(
      packageName = sbn.packageName,
      title = title,
      body = body,
      postedAt = sbn.postTime
    )
  }
}
