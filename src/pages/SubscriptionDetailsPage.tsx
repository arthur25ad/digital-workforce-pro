import PageLayout from "@/components/PageLayout";
import SubscriptionDetails from "@/components/SubscriptionDetails";
import { motion } from "framer-motion";

const SubscriptionDetailsPage = () => {
  return (
    <PageLayout>
      <section className="px-4 pt-24 pb-16 md:px-8 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Subscription Details
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your plan, billing, and subscription preferences.
            </p>
          </motion.div>
          <SubscriptionDetails />
        </div>
      </section>
    </PageLayout>
  );
};

export default SubscriptionDetailsPage;
