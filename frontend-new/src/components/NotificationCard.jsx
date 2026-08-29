import { AlertTriangle, RefreshCw, CheckCircle, X } from 'lucide-react';

/**
 * NotificationCard — centered glass-card overlay.
 *
 * Replaces the bottom-toast notification system entirely.
 *
 * Props:
 *   type        {'success'|'error'} – card variant
 *   message     {string}            – primary text
 *   technical   {string|null}       – muted detail line (error variant only)
 *   onClose     {function}          – called on backdrop click or × button
 *   onRetry     {function|null}     – called on Retry button (error variant only)
 */
export default function NotificationCard({ type, message, technical, onClose, onRetry }) {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <div
      className="notification-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isError ? 'Error notification' : 'Success notification'}
    >
      <div
        className={`notification-card${isError ? ' notification-card--error' : ' notification-card--success'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner close button */}
        <button
          className="notif-close-btn"
          onClick={onClose}
          aria-label="Dismiss notification"
        >
          <X size={18} />
        </button>

        {/* Icon badge */}
        <div className={`notif-icon-badge${isError ? ' notif-icon-badge--error' : ' notif-icon-badge--success'}`}>
          {isError
            ? <AlertTriangle size={30} />
            : <CheckCircle size={30} />
          }
        </div>

        {/* Error: heading + message; Success: just message */}
        {isError && (
          <h3 className="notif-heading">Something went wrong</h3>
        )}

        <p className={`notif-message${isError ? '' : ' notif-message--success'}`}>
          {message}
        </p>

        {/* Technical detail — error only */}
        {isError && technical && (
          <p className="notif-technical">{technical}</p>
        )}

        {/* Retry button — error only */}
        {isError && onRetry && (
          <button className="notif-retry-btn" onClick={onRetry}>
            <RefreshCw size={16} />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
