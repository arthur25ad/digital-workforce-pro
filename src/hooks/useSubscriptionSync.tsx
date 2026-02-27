import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPackageByPriceId } from "@/lib/packages";

interface SubscriptionStatus {
  subscribed: boolean;
  product_id: string | null;
  price_id: string | null;
  subscription_end: string | null;
}

export function useSubscriptionSync() {
  const syncSubscription = useCallback(async (): Promise<{ packageKey: string | null; subscribed: boolean }> => {
    try {
      const { data, error } = await supabase.functions.invoke<SubscriptionStatus>("check-subscription");
      if (error) throw error;

      if (!data?.subscribed || !data.price_id) {
        return { packageKey: null, subscribed: false };
      }

      const pkg = getPackageByPriceId(data.price_id);
      if (!pkg) {
        console.warn("Unknown Stripe price_id:", data.price_id);
        return { packageKey: null, subscribed: true };
      }

      // Update profile with correct package
      const { data: { user } } = await supabase.auth.getUser();
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
      return { packageKey: null, subscribed: false };
    }
  }, []);

  return { syncSubscription };
}
