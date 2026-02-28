import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, RefreshCw } from "lucide-react";

const DECLINE_MESSAGES: Record<string, string> = {
  insufficient_funds: "Your card has insufficient funds. Please use another payment method.",
  card_declined: "Your card was declined. Please try another payment method.",
  generic_decline: "Your card was declined. Please try another payment method.",
  do_not_honor: "Your bank declined the transaction. Please contact your bank or use another card.",
  authentication_required: "Your bank needs additional verification. Please try again or use another card.",
  authentication_failure: "Bank verification failed. Please try again or use another card.",
  expired_card: "Your card has expired. Please use a different card.",
  processing_error: "A processing error occurred. Please try again in a moment.",
  lost_card: "This card cannot be used. Please try another payment method.",
  stolen_card: "This card cannot be used. Please try another payment method.",
};

const DEFAULT_MESSAGE = "Your payment could not be completed. Please try another payment method.";

interface CheckoutFailedBannerProps {
  reason?: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const CheckoutFailedBanner = ({ reason, onRetry, onDismiss }: CheckoutFailedBannerProps) => {
  const [visible, setVisible] = useState(true);

  const message = reason && DECLINE_MESSAGES[reason] ? DECLINE_MESSAGES[reason] : DEFAULT_MESSAGE;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-xl border border-destructive/30 bg-destructive/5 p-4 md:p-5"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle size={16} className="text-destructive" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Payment unsuccessful</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <RefreshCw size={12} />
                    Try Again
                  </button>
                )}
                <button
                  onClick={handleDismiss}
                  className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutFailedBanner;
