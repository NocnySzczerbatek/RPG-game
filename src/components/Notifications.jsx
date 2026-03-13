// ============================================================
// COMPONENT: Notifications
// ============================================================
import React, { useEffect } from 'react';

const TYPE_STYLES = {
  info: 'bg-slate-800 border-slate-600 text-slate-200',
  success: 'bg-green-950 border-green-700 text-green-300',
  error: 'bg-red-950 border-red-700 text-red-300',
  warning: 'bg-yellow-950 border-yellow-700 text-yellow-300',
  quest: 'bg-purple-950 border-purple-600 text-purple-200',
  level_up: 'bg-amber-950 border-amber-500 text-amber-200',
  legendary: 'bg-orange-950 border-orange-500 text-orange-200',
  divine: 'bg-yellow-900 border-yellow-300 text-yellow-100',
};

const TYPE_ICONS = {
  info: 'ℹ️',
  success: '✅',
  error: '❌',
  warning: '⚠️',
  quest: '📜',
  level_up: '⬆️',
  legendary: '⭐',
  divine: '✨',
};

const Notifications = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      {notifications.map((notif) => (
        <AutoDismissNotification
          key={notif.id}
          notif={notif}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

const AutoDismissNotification = ({ notif, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(notif.id), 4000);
    return () => clearTimeout(timer);
  }, [notif.id, onDismiss]);

  const style = TYPE_STYLES[notif.type] || TYPE_STYLES.info;
  const icon = TYPE_ICONS[notif.type] || 'ℹ️';

  return (
    <div
      className={`pointer-events-auto border rounded px-3 py-2 text-xs font-crimson flex items-start gap-2 shadow-lg animate-float-up cursor-pointer ${style}`}
      onClick={() => onDismiss(notif.id)}
    >
      <span className="text-sm shrink-0">{icon}</span>
      <span>{notif.message}</span>
    </div>
  );
};

export default Notifications;
