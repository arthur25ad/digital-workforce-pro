import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPackageByPriceId } from "@/lib/packages";

interface SubscriptionStatus {
  subscribed: boolean;
  product_id: string | null;
  price_id: string | null;
  subscription_end: string | null;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function useSubscriptionSync() {
  const syncSubscription = useCallback(
    async (options?: { retries?: number; delayMs?: number }): Promise<{
      packageKey: string | null;
      subscribed: boolean;
    }> => {
      const maxRetries = options?.retries ?? 1;
      const retryDelay = options?.delayMs ?? 2000;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            console.log(`[SubscriptionSync] Retry attempt ${attempt}/${maxRetries}`);
            await delay(retryDelay);
          }

          const { data, error } = await supabase.functions.invoke<SubscriptionStatus>("check-subscription");
          if (error) throw error;

          if (!data?.subscribed || !data.price_id) {
            // If not found and we have retries left, continue
            if (attempt < maxRetries) continue;
            return { packageKey: null, subscribed: false };
          }

          // Owner bypass — always gets team package
          if (data.price_id === "owner_bypass") {
            return { packageKey: "team", subscribed: true };
          }

          const pkg = getPackageByPriceId(data.price_id);
          if (!pkg) {
            console.warn("Unknown Stripe price_id:", data.price_id);
            return { packageKey: null, subscribed: true };
          }

          // Update profile with correct package
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const updates: Record<string, any> = {
              active_package: pkg.key,
              subscription_status: "active",
            };

            // Team plan auto-unlocks all roles
            if (pkg.autoUnlockAll) {
              updates.unlocked_roles = [...pkg.defaultRoles];
            }

            await supabase.from("profiles").update(updates).eq("id", user.id);
          }

          return { packageKey: pkg.key, subscribed: true };
        } catch (err) {
          console.error("Subscription sync error:", err);
          if (attempt >= maxRetries) {
            return { packageKey: null, subscribed: false };
          }
        }
      }

      return { packageKey: null, subscribed: false };
    },
    []
  );

  return { syncSubscription };
}
