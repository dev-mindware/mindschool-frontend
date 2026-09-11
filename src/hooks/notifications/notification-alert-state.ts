const alertedNotificationIds = new Set<string>();
let baselineEstablished = false;

export const notificationAlertState = {
  establishBaseline(notificationIds: string[]) {
    notificationIds.forEach((id) => alertedNotificationIds.add(id));
    baselineEstablished = true;
  },

  isBaselineEstablished() {
    return baselineEstablished;
  },

  shouldAlert(notificationId: string) {
    if (!baselineEstablished) return false;
    if (alertedNotificationIds.has(notificationId)) return false;

    alertedNotificationIds.add(notificationId);
    return true;
  },

  resetForTests() {
    alertedNotificationIds.clear();
    baselineEstablished = false;
  },
};
