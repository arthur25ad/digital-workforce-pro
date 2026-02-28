import PageLayout from "@/components/PageLayout";
import { motion } from "framer-motion";

const PrivacyPage = () => (
  <PageLayout>
    <section className="section-padding blue-ambient">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: February 2026</p>

          <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">1. Information We Collect</h2>
              <p>We collect information you provide when creating an account, configuring your AI team, or connecting third-party platforms. This includes your business name, email address, preferences, and connected account details.</p>
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
              <p>Your information is used to personalize your AI employee experience, generate relevant content, improve our services, and communicate important updates. We never sell your personal data to third parties.</p>
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">3. Data Storage & Security</h2>
              <p>All data is encrypted in transit and at rest. We use industry-standard security measures to protect your information. Connected platform credentials are securely stored using OAuth tokens and are never visible to our team.</p>
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">4. Third-Party Integrations</h2>
              <p>When you connect platforms like Instagram, Gmail, or Slack, we access only the permissions you authorize. You can disconnect any platform at any time from your dashboard.</p>
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">5. Your Rights</h2>
              <p>You may request access to, correction of, or deletion of your personal data at any time by contacting our support team. We will respond to all requests within 30 days.</p>
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">6. Contact</h2>
              <p>For questions about this policy, please reach out to <a href="mailto:vantoryteam@gmail.com" className="text-primary hover:underline">vantoryteam@gmail.com</a> or call <a href="tel:+18067794074" className="text-primary hover:underline">+1 (806) 779-4074</a>.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  </PageLayout>
);

export default PrivacyPage;
