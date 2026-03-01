import { useState } from "react";
import { useShopify } from "@/hooks/useShopify";
import { ShoppingBag, RefreshCw, Unplug, Package, FolderOpen, Headphones, Mail, Share2, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const ShopifySettingsPanel = () => {
  const {
    settings, isConnected, loading, syncing, connecting,
    startConnect, syncStore, disconnect, updateSettings,
  } = useShopify();
  const [shopDomain, setShopDomain] = useState("");
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-48 rounded bg-muted" />
        <div className="h-10 rounded bg-muted" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShoppingBag size={16} className="text-primary" />
          <span>Connect your Shopify store to use product data across your AI workforce.</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={shopDomain}
            onChange={(e) => setShopDomain(e.target.value)}
            placeholder="your-store.myshopify.com"
            className="flex-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
          />
          <button
            onClick={() => startConnect(shopDomain)}
            disabled={!shopDomain.trim() || connecting}
            className="btn-glow !px-4 !py-2 text-xs disabled:opacity-50"
          >
            {connecting ? "Connecting…" : "Connect"}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground/60">
          You'll be redirected to Shopify to authorize access. Only read permissions are requested.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Store info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#96bf48]/20">
            <ShoppingBag size={18} className="text-[#96bf48]" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{settings?.shop_name || settings?.shop_domain}</p>
            <p className="text-xs text-muted-foreground">
              {settings?.shop_domain}
              {settings?.currency && ` · ${settings.currency}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={syncStore}
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing…" : "Sync"}
          </button>
        </div>
      </div>

      {/* Sync info */}
      {settings?.last_synced_at && (
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground/60">
          <span className="flex items-center gap-1">
            <Package size={10} />
            {Array.isArray(settings.synced_products) ? settings.synced_products.length : 0} products
          </span>
          <span className="flex items-center gap-1">
            <FolderOpen size={10} />
            {Array.isArray(settings.synced_collections) ? settings.synced_collections.length : 0} collections
          </span>
          <span>Last synced: {new Date(settings.last_synced_at).toLocaleDateString()}</span>
        </div>
      )}

      {/* AI Role Toggles */}
      <div className="space-y-3 border-t border-border/30 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Use Shopify data in</p>

        <ToggleRow
          icon={Headphones}
          label="Customer Support AI"
          description="Use store context to improve support replies"
          checked={settings?.use_for_support_ai ?? true}
          onChange={(v) => updateSettings({ use_for_support_ai: v })}
        />
        <ToggleRow
          icon={Mail}
          label="Email Marketer"
          description="Use products for campaign and email ideas"
          checked={settings?.use_for_email_marketing ?? true}
          onChange={(v) => updateSettings({ use_for_email_marketing: v })}
        />
        <ToggleRow
          icon={Share2}
          label="Social Media Manager"
          description="Use products for social content suggestions"
          checked={settings?.use_for_social_content ?? true}
          onChange={(v) => updateSettings({ use_for_social_content: v })}
        />
      </div>

      {/* Data Toggles */}
      <div className="space-y-3 border-t border-border/30 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Context settings</p>
        <ToggleRow
          icon={Package}
          label="Product context"
          description="Include product names and types in AI suggestions"
          checked={settings?.enable_product_context ?? true}
          onChange={(v) => updateSettings({ enable_product_context: v })}
        />
        <ToggleRow
          icon={FolderOpen}
          label="Collection context"
          description="Include collection names in AI suggestions"
          checked={settings?.enable_collection_context ?? true}
          onChange={(v) => updateSettings({ enable_collection_context: v })}
        />
      </div>

      {/* Disconnect */}
      <div className="border-t border-border/30 pt-4">
        {showDisconnectConfirm ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Disconnect this store?</span>
            <button onClick={disconnect} className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/20 transition-colors">
              Yes, disconnect
            </button>
            <button onClick={() => setShowDisconnectConfirm(false)} className="text-xs text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDisconnectConfirm(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-destructive transition-colors"
          >
            <Unplug size={12} />
            Disconnect Shopify
          </button>
        )}
      </div>
    </div>
  );
};

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <Icon size={14} className="text-muted-foreground shrink-0" />
        <div>
          <p className="text-sm text-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground/60">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default ShopifySettingsPanel;
