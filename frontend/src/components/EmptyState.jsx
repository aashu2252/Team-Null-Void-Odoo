import React from 'react';
import { Truck, MapPin, Users, FileText, Bell, AlertTriangle } from 'lucide-react';

export default function EmptyState({ type = 'trips', title, description, actionText, onAction }) {
  const renderIllustration = () => {
    switch (type) {
      case 'fleet':
        return (
          <div className="relative w-36 h-36 flex items-center justify-center bg-brand-primary/5 dark:bg-brand-primary/10 rounded-full mb-6">
            <svg viewBox="0 0 200 200" className="w-full h-full text-brand-primary opacity-20 absolute top-0 left-0 animate-pulse">
              <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6,6" />
            </svg>
            <Truck className="w-16 h-16 text-brand-primary" />
            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-brand-teal/20 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-brand-teal rounded-full animate-ping" />
            </div>
          </div>
        );
      case 'drivers':
        return (
          <div className="relative w-36 h-36 flex items-center justify-center bg-brand-purple/5 dark:bg-brand-purple/10 rounded-full mb-6">
            <svg viewBox="0 0 200 200" className="w-full h-full text-brand-purple opacity-20 absolute top-0 left-0">
              <rect x="40" y="40" width="120" height="120" rx="20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4,4" />
            </svg>
            <Users className="w-16 h-16 text-brand-purple" />
          </div>
        );
      case 'reports':
        return (
          <div className="relative w-36 h-36 flex items-center justify-center bg-brand-orange/5 dark:bg-brand-orange/10 rounded-full mb-6">
            <svg viewBox="0 0 200 200" className="w-full h-full text-brand-orange opacity-20 absolute top-0 left-0">
              <polygon points="100,20 180,80 180,180 20,180 20,80" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
            </svg>
            <FileText className="w-16 h-16 text-brand-orange" />
          </div>
        );
      case 'notifications':
        return (
          <div className="relative w-36 h-36 flex items-center justify-center bg-brand-warning/5 dark:bg-brand-warning/10 rounded-full mb-6">
            <svg viewBox="0 0 200 200" className="w-full h-full text-brand-warning opacity-20 absolute top-0 left-0">
              <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            <Bell className="w-16 h-16 text-brand-warning" />
          </div>
        );
      case 'maintenance':
        return (
          <div className="relative w-36 h-36 flex items-center justify-center bg-brand-danger/5 dark:bg-brand-danger/10 rounded-full mb-6">
            <svg viewBox="0 0 200 200" className="w-full h-full text-brand-danger opacity-20 absolute top-0 left-0">
              <path d="M50 30 L150 30 L170 170 L30 170 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6,6" />
            </svg>
            <AlertTriangle className="w-16 h-16 text-brand-danger" />
          </div>
        );
      case 'trips':
      default:
        return (
          <div className="relative w-36 h-36 flex items-center justify-center bg-brand-teal/5 dark:bg-brand-teal/10 rounded-full mb-6">
            <svg viewBox="0 0 200 200" className="w-full h-full text-brand-teal opacity-20 absolute top-0 left-0 animate-spin-slow">
              <circle cx="100" cy="100" r="75" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10,10" />
            </svg>
            <MapPin className="w-16 h-16 text-brand-teal animate-bounce" />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-card-bg dark:bg-card-bg/40 border border-border-custom dark:border-border-custom/50 rounded-[20px] shadow-premium max-w-lg mx-auto transition-all duration-300 hover:shadow-premium-hover">
      {renderIllustration()}
      <h3 className="text-lg font-bold text-txt-primary dark:text-txt-primary/90 mb-2">
        {title || `No ${type.charAt(0).toUpperCase() + type.slice(1)} Found`}
      </h3>
      <p className="text-sm text-txt-secondary dark:text-txt-secondary/70 mb-6 max-w-sm">
        {description || `It looks like you don't have any ${type} records in your system yet.`}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-primary/20 hover:bg-brand-primary/95 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
