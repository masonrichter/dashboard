/**
 * Utility functions for triggering analytics refresh after campaign sends
 */

/**
 * Triggers an analytics refresh event that the analytics page will listen for
 */
export function triggerAnalyticsRefresh() {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('campaign-sent', {
      detail: {
        timestamp: new Date().toISOString(),
        source: 'campaign-send'
      }
    });
    window.dispatchEvent(event);
  }
}

/**
 * Triggers analytics refresh and shows a success notification
 */
export function triggerAnalyticsRefreshWithNotification(message: string) {
  triggerAnalyticsRefresh();
  
  // You can add toast notification here if you have a toast system
  console.log(`Campaign sent: ${message}. Analytics will refresh automatically.`);
}
