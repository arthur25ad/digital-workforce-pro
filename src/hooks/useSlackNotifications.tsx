import { useSlackIntegration } from "./useSlackIntegration";
import { useCallback } from "react";

/**
 * Hook for sending contextual Slack notifications from AI role demos.
 * Checks connection state and notification toggles before sending.
 */
export const useSlackNotifications = () => {
  const { sendNotification, isConnected, settings } = useSlackIntegration();

  const notifySupportEscalation = useCallback(
    async (customerName: string, issueSummary: string) => {
      return sendNotification(
        `🚨 *Support Escalation*\nCustomer: ${customerName}\n${issueSummary}\n\nThis ticket needs human review.`,
        "support_alerts"
      );
    },
    [sendNotification]
  );

  const notifyContentReady = useCallback(
    async (contentTitle: string, platform: string) => {
      return sendNotification(
        `📝 *Content Ready for Review*\n"${contentTitle}" for ${platform} is ready for your approval.`,
        "content_approvals"
      );
    },
    [sendNotification]
  );

  const notifyCampaignDraftReady = useCallback(
    async (campaignName: string, draftCount: number) => {
      return sendNotification(
        `📧 *Email Drafts Ready*\n${draftCount} new draft(s) generated for "${campaignName}". Review and approve when ready.`,
        "marketing_updates"
      );
    },
    [sendNotification]
  );

  const notifySchedulingAlert = useCallback(
    async (message: string) => {
      return sendNotification(
        `📅 *Scheduling Alert*\n${message}`,
        "scheduling_alerts"
      );
    },
    [sendNotification]
  );

  const notifyBillingAlert = useCallback(
    async (message: string) => {
      return sendNotification(
        `💳 *Account Update*\n${message}`,
        "billing_alerts"
      );
    },
    [sendNotification]
  );

  return {
    isConnected,
    settings,
    notifySupportEscalation,
    notifyContentReady,
    notifyCampaignDraftReady,
    notifySchedulingAlert,
    notifyBillingAlert,
  };
};
