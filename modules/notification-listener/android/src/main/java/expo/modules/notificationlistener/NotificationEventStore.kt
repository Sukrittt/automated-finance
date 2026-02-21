package expo.modules.notificationlistener

data class NotificationEvent(
  val packageName: String,
  val title: String?,
  val body: String?,
  val postedAt: Long
)

object NotificationEventStore {
  @Volatile
  var lastEvent: NotificationEvent? = null
}
