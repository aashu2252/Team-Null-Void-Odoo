import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon,
  CreditCard,
  Key,
  Shield,
  Plus,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [apiKeys, setApiKeys] = useState([
    { id: 'key-1', name: 'Live Telematics Sync Webhook', key: 'pk_live_84d72a91bc7f42', created: 'Jul 10, 2026', status: 'Active' },
    { id: 'key-2', name: 'Stripe Accounting Billing Webhook', key: 'pk_live_09b552fc3814de', created: 'Jul 01, 2026', status: 'Active' }
  ]);

  const tabs = [
    { id: 'general', name: 'Workspace Preferences', icon: SettingsIcon },
    { id: 'billing', name: 'Subscription & Pricing', icon: CreditCard },
    { id: 'api', name: 'Developer APIs', icon: Key },
    { id: 'security', name: 'Compliance Audits', icon: Shield }
  ];

  const handleGenerateApiKey = () => {
    const createdId = 'key-' + (apiKeys.length + 1);
    const rand = Math.random().toString(36).substring(2, 16);
    const newKey = {
      id: createdId,
      name: 'Developer Sandbox Key',
      key: `pk_test_${rand}`,
      created: 'Jul 12, 2026',
      status: 'Active'
    };

    setApiKeys(prev => [...prev, newKey]);
    toast.success('Developer API Sandbox Token Key generated!', {
      style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
    });
  };

  const handleRevokeApiKey = (id) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
    toast.success('Developer credentials revoked successfully.', {
      style: { background: '#182230', color: '#F8FAFC', border: '1px solid #2B3645' }
    });
  };

  return (
    <div className="space-y-6 max-w-full">
      <div>
        <h2 className="text-xl font-bold text-txt-primary">Workspace Administration Console</h2>
        <p className="text-xs text-txt-secondary mt-0.5">Customize notification webhooks, manage subscription plans, extract developer APIs.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT TABBED NAVIGATION */}
        <div className="w-full lg:w-64 bg-card-bg border border-border-custom p-3 rounded-[20px] shadow-premium flex flex-col gap-1 shrink-0">
          {tabs.map((tab) => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-txt-secondary hover:bg-surface hover:text-txt-primary'
                }`}
              >
                <IconComp className="w-4 h-4 shrink-0" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-card-bg border border-border-custom rounded-[20px] p-6 shadow-premium"
            >
              
              {/* TAB 1: GENERAL */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="border-b border-border-custom pb-3">
                    <h3 className="text-sm font-bold text-txt-primary">Workspace Preferences</h3>
                    <p className="text-xs text-txt-secondary mt-0.5">Configure division localization parameters.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                        Corporate Workspace Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Apex Logistics Inc."
                        className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 rounded-xl px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-txt-secondary mb-1">
                        Operational Timezone
                      </label>
                      <select className="w-full bg-surface dark:bg-card-elevated border border-border-custom/80 text-txt-primary px-3 py-2 rounded-xl text-xs focus:outline-none">
                        <option>America/New_York (EST)</option>
                        <option>America/Los_Angeles (PST)</option>
                        <option>Europe/London (GMT)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border-custom flex justify-end">
                    <button
                      onClick={() => toast.success('Workspace preferences updated successfully.')}
                      className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-primary/10 hover:bg-brand-primary/95 transition-all cursor-pointer"
                    >
                      Update preferences
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: BILLING */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <div className="border-b border-border-custom pb-3">
                    <h3 className="text-sm font-bold text-txt-primary">Subscription Plan Details</h3>
                    <p className="text-xs text-txt-secondary mt-0.5">Review pricing sheets and active features limits.</p>
                  </div>

                  <div className="p-4 bg-gradient-to-tr from-brand-primary/10 to-brand-teal/10 border border-brand-primary/20 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-brand-primary">Active Division Plan</span>
                      <h4 className="text-base font-extrabold text-txt-primary mt-1">TransitOps Enterprise Scale</h4>
                      <p className="text-xs text-txt-secondary mt-0.5">Uptime telemetry limits: Unlimited vehicles & drivers.</p>
                    </div>
                    <span className="text-xs font-bold text-white bg-brand-primary px-3 py-1 rounded-lg">ACTIVE Plan</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border-custom pt-4 text-xs font-semibold">
                    <div>
                      <span className="text-[10px] text-txt-secondary uppercase font-bold block mb-1">Pricing Billing Period</span>
                      <span className="text-txt-primary">Monthly renews ($499/mo)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-txt-secondary uppercase font-bold block mb-1">Renewal Billing Date</span>
                      <span className="text-txt-primary">August 01, 2026 (Auto-Stripe renewal)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: API */}
              {activeTab === 'api' && (
                <div className="space-y-6">
                  <div className="border-b border-border-custom pb-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-txt-primary">Developer API Integration Keys</h3>
                      <p className="text-xs text-txt-secondary mt-0.5">Configure live webhooks for vehicle telematics synching.</p>
                    </div>
                    <button
                      onClick={handleGenerateApiKey}
                      className="flex items-center gap-1.5 px-3 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Key</span>
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {apiKeys.map((k) => (
                      <div key={k.id} className="p-3 bg-surface/50 dark:bg-card-elevated border border-border-custom rounded-xl flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-txt-primary truncate">{k.name}</h4>
                          <span className="text-[10px] font-mono text-txt-secondary block mt-0.5 bg-surface dark:bg-card-bg px-2 py-0.5 border border-border-custom rounded truncate max-w-[320px]">
                            {k.key}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] font-bold text-brand-success bg-brand-success/10 px-2 py-0.5 rounded-full">
                            {k.status}
                          </span>
                          <button
                            onClick={() => handleRevokeApiKey(k.id)}
                            className="p-1 text-txt-secondary hover:text-brand-danger hover:bg-brand-danger/10 rounded transition-colors cursor-pointer"
                            title="Revoke credential"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: SECURITY */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="border-b border-border-custom pb-3">
                    <h3 className="text-sm font-bold text-txt-primary">Compliance Audit Logs</h3>
                    <p className="text-xs text-txt-secondary mt-0.5">Monitor system-level modifications and credential updates.</p>
                  </div>

                  <div className="relative border-l-2 border-border-custom ml-3 space-y-4 py-1">
                    <div className="relative pl-5">
                      <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-brand-primary rounded-full" />
                      <div className="flex justify-between items-center text-xs">
                        <h4 className="font-bold text-txt-primary">API Sandbox Webhook Generated</h4>
                        <span className="text-[10px] text-txt-secondary font-mono">Jul 12, 2026 11:10 AM</span>
                      </div>
                      <p className="text-[10px] text-txt-secondary mt-0.5">Workspace admin lead requested testing API credential keys.</p>
                    </div>

                    <div className="relative pl-5">
                      <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-brand-success rounded-full" />
                      <div className="flex justify-between items-center text-xs">
                        <h4 className="font-bold text-txt-primary">CDL Driver Marcus Vance Checked</h4>
                        <span className="text-[10px] text-txt-secondary font-mono">Jul 12, 2026 09:14 AM</span>
                      </div>
                      <p className="text-[10px] text-txt-secondary mt-0.5">Automatic license validation cron verified FMCRA safety logs.</p>
                    </div>

                    <div className="relative pl-5">
                      <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-brand-warning rounded-full" />
                      <div className="flex justify-between items-center text-xs">
                        <h4 className="font-bold text-txt-primary">Failed Login Attempt Bypass</h4>
                        <span className="text-[10px] text-txt-secondary font-mono">Jul 12, 2026 08:00 AM</span>
                      </div>
                      <p className="text-[10px] text-txt-secondary mt-0.5">Backend offline bypass activated client-side credentials authentication.</p>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
