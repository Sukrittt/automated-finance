export interface CapturedNotification {
  packageName: string;
  title: string | null;
  body: string | null;
  postedAt: number;
}

export interface NotificationListenerModuleApi {
  isNotificationAccessEnabled(): boolean;
  openNotificationAccessSettings(): Promise<void>;
  getLastCapturedNotification(): CapturedNotification | null;
}
