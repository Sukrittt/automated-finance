package expo.modules.notificationlistener

import android.content.ComponentName
import android.content.Intent
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NotificationListenerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NotificationListener")

    Function("isNotificationAccessEnabled") {
      val context = appContext.reactContext?.applicationContext ?: return@Function false
      isServiceEnabled(context.packageName)
    }

    AsyncFunction("openNotificationAccessSettings") {
      val context = appContext.reactContext?.applicationContext
        ?: throw IllegalStateException("React context unavailable")

      val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(intent)
    }

    Function("getLastCapturedNotification") {
      NotificationEventStore.lastEvent?.let { event ->
        mapOf(
          "packageName" to event.packageName,
          "title" to event.title,
          "body" to event.body,
          "postedAt" to event.postedAt
        )
      }
    }
  }

  private fun isServiceEnabled(packageName: String): Boolean {
    val context = appContext.reactContext?.applicationContext ?: return false
    val enabledListeners = Settings.Secure.getString(
      context.contentResolver,
      "enabled_notification_listeners"
    ) ?: return false

    return enabledListeners
      .split(":")
      .mapNotNull(ComponentName::unflattenFromString)
      .any { component ->
        component.packageName == packageName &&
          component.className == NotificationCaptureService::class.java.name
      }
  }
}
