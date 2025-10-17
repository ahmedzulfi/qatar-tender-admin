// components/NotificationDemo.js
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";

/**
 * NotificationDemo
 * - Whole card clickable
 * - Marks as read then navigates
 * - Routes follow user's mapping and use `business-dashboard` or `dashboard` prefix
 * - Enhanced UI with better colors and visual hierarchy
 *
 * date-fns:
 * - Shows relative time (e.g. "3 minutes ago")
 * - If older than 7 days shows full date "29 Aug 2025"
 * - Single interval updates all timestamps every 30s for live feel
 */

const NotificationDemo = () => {
  const router = useRouter();
  const {
    notifications = [],
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading,
  } = useNotifications() || {};
  const { user, profile } = useAuth() || {};
  const [isExpanded, setIsExpanded] = useState(true);

  // "now" state to trigger re-renders so relative timestamps update live
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000); // update every 30s
    return () => clearInterval(id);
  }, []);

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-slate-700 font-semibold text-lg mb-1">
            Sign In Required
          </h3>
          <p className="text-slate-500 text-sm">
            Please sign in to view your notifications
          </p>
        </div>
      </div>
    );
  }

  const prefix = () =>
    profile?.userType === "business" ? "business-dashboard" : "dashboard";

  const getId = (maybeObj: { _id: any; toString: () => any }) => {
    if (!maybeObj) return null;
    if (typeof maybeObj === "string") return maybeObj;
    if (maybeObj._id) return String(maybeObj._id);
    if (typeof maybeObj.toString === "function") return maybeObj.toString();
    return null;
  };

  const getNotificationRoute = (n: {
    relatedTender: { _id: any; toString: () => any };
    relatedBid: { _id: any; toString: () => any };
    relatedUser: { _id: any; toString: () => any };
    relatedPayment: { _id: any; toString: () => any };
    profileId: { _id: any; toString: () => any };
    type: any;
  }) => {
    const tenderId = getId(n.relatedTender);
    const bidId = getId(n.relatedBid);
    const userId = getId(n.relatedUser);
    const paymentId = getId(n.relatedPayment);
    const profileId = getId(n.profileId);

    switch (n.type) {
      case "user_registered":
      case "password_changed":
      case "emailchanged":
      case "profile":
      case "verification":
      case "password_setting_change":
      case "transaction":
        return `/admin/users/${userId || ""}`;

      case "question":
      case "answer":
      case "new_tender":
      case "tender_posted":
      case "tender_created":
      case "tender_updated":
      case "tender_status":
        return `/admin/tenders/${tenderId || ""}`;

      case "tender_awarded":
        return `/admin/tenders/${tenderId || ""}`;

      case "tender_deleted":
        return `/admin/tenders`;

      case "new_bid_received":
      case "bid_submitted":
      case "bid_status_update":
      case "bid_rejected":
      case "bid_deleted":
        return `/admin/bids/${bidId || ""}`;

      case "payment_success":
      case "bid_paid":
        return `/admin/payments/${paymentId || ""}`;

      default:
        return `/admin`;
    }
  };

  const getNotificationTheme = (type: string) => {
    switch (type) {
      case "new_tender":
      case "tender_created":
      case "tender_posted":
        return {
          bg: "bg-gradient-to-r from-emerald-50 to-teal-50/50",
          border: "border-emerald-200/60",
          iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-200",
          iconColor: "text-emerald-600",
          badge: "bg-emerald-100 text-emerald-700 border border-emerald-200/50",
          dot: "bg-emerald-500",
        };
      case "tender_awarded":
        return {
          bg: "bg-gradient-to-r from-amber-50 to-yellow-50/50",
          border: "border-amber-200/60",
          iconBg: "bg-gradient-to-br from-amber-100 to-amber-200",
          iconColor: "text-amber-600",
          badge: "bg-amber-100 text-amber-700 border border-amber-200/50",
          dot: "bg-amber-500",
        };
      case "bid_rejected":
      case "bid_deleted":
      case "tender_deleted":
        return {
          bg: "bg-gradient-to-r from-red-50 to-rose-50/50",
          border: "border-red-200/60",
          iconBg: "bg-gradient-to-br from-red-100 to-red-200",
          iconColor: "text-red-600",
          badge: "bg-red-100 text-red-700 border border-red-200/50",
          dot: "bg-red-500",
        };
      case "new_bid_received":
      case "bid_submitted":
      case "bid_status_update":
        return {
          bg: "bg-gradient-to-r from-blue-50 to-indigo-50/50",
          border: "border-blue-200/60",
          iconBg: "bg-gradient-to-br from-blue-100 to-blue-200",
          iconColor: "text-blue-600",
          badge: "bg-blue-100 text-blue-700 border border-blue-200/50",
          dot: "bg-blue-500",
        };
      case "question":
      case "answer":
        return {
          bg: "bg-gradient-to-r from-purple-50 to-violet-50/50",
          border: "border-purple-200/60",
          iconBg: "bg-gradient-to-br from-purple-100 to-purple-200",
          iconColor: "text-purple-600",
          badge: "bg-purple-100 text-purple-700 border border-purple-200/50",
          dot: "bg-purple-500",
        };
      case "payment_success":
      case "bid_paid":
      case "transaction":
        return {
          bg: "bg-gradient-to-r from-green-50 to-emerald-50/50",
          border: "border-green-200/60",
          iconBg: "bg-gradient-to-br from-green-100 to-green-200",
          iconColor: "text-green-600",
          badge: "bg-green-100 text-green-700 border border-green-200/50",
          dot: "bg-green-500",
        };
      case "password_changed":
      case "password_setting_change":
      case "user_registered":
      case "emailchanged":
      case "profile":
      case "verification":
        return {
          bg: "bg-gradient-to-r from-orange-50 to-amber-50/50",
          border: "border-orange-200/60",
          iconBg: "bg-gradient-to-br from-orange-100 to-orange-200",
          iconColor: "text-orange-600",
          badge: "bg-orange-100 text-orange-700 border border-orange-200/50",
          dot: "bg-orange-500",
        };
      default:
        return {
          bg: "bg-gradient-to-r from-slate-50 to-gray-50/50",
          border: "border-slate-200/60",
          iconBg: "bg-gradient-to-br from-slate-100 to-slate-200",
          iconColor: "text-slate-600",
          badge: "bg-slate-100 text-slate-700 border border-slate-200/50",
          dot: "bg-slate-500",
        };
    }
  };

  const getNotificationIcon = (type: string) => {
    const commonProps = {
      className: "w-5 h-5 flex-shrink-0",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
    };
    switch (type) {
      case "new_tender":
      case "tender_created":
      case "tender_posted":
        return (
          <svg {...commonProps}>
            <path
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6M12 3v4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "tender_awarded":
        return (
          <svg {...commonProps}>
            <path
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4M14 14l-4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "bid_rejected":
      case "bid_deleted":
        return (
          <svg {...commonProps}>
            <path
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 14l4-4M14 14l-4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "new_bid_received":
      case "bid_submitted":
      case "bid_status_update":
        return (
          <svg {...commonProps}>
            <path
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 10h4l3 8 4-16 3 8h4"
            />
          </svg>
        );
      case "question":
      case "answer":
        return (
          <svg {...commonProps}>
            <path
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            />
          </svg>
        );
      case "payment_success":
      case "bid_paid":
      case "transaction":
        return (
          <svg {...commonProps}>
            <path
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8c-3 0-5 2-5 4s2 4 5 4 5-2 5-4-2-4-5-4zM12 2v4"
            />
          </svg>
        );
      case "password_changed":
      case "password_setting_change":
        return (
          <svg {...commonProps}>
            <path
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m0-10a4 4 0 00-4 4v2h8v-2a4 4 0 00-4-4z"
            />
          </svg>
        );
      default:
        return (
          <svg {...commonProps}>
            <path
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20v-6M6 10l6-6 6 6"
            />
          </svg>
        );
    }
  };

  const formatTypeLabel = (type: string) => {
    if (!type) return "General";
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const timeAgoOrDate = (createdAt: string | number | Date) => {
    if (!createdAt) return "";
    const date = new Date(createdAt);
    // days difference relative to current "now"
    const days = differenceInDays(now, date);
    // if older than 7 days show absolute date
    if (days >= 7) {
      return format(date, "dd MMM yyyy");
    }
    // otherwise show relative like "3 minutes ago", "yesterday"
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const handleOpenNotification = async (n: any) => {
    const route = getNotificationRoute(n);
    if (!route) return;

    try {
      if (!n.isRead && markAsRead) {
        await markAsRead(n._id);
      }
    } catch (err) {
      console.error("markAsRead failed:", err);
    } finally {
      router.push(route);
    }
  };

  return (
    <div className="mx-auto p-4 px-10">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/40 overflow-hidden shadow-xl shadow-slate-200/20">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/40 backdrop-blur-xl border-b border-slate-200/30 p-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Back Button */}
              <button
                onClick={() => router.back()}
                className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-800 font-medium px-3 py-2 rounded-lg hover:bg-slate-100/60 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Back</span>
              </button>

              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-slate-500 mt-2 font-medium">
                    {unreadCount} unread notification
                    {unreadCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full h-7 min-w-7 px-2 flex items-center justify-center shadow-lg shadow-red-200/40">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center space-x-3 text-slate-600">
              <div className="w-5 h-5 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="font-semibold text-lg">
                Loading notifications...
              </span>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`${
                isExpanded ? "max-h-none" : "max-h-96"
              } overflow-y-auto`}
            >
              {notifications.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                      />
                      <path
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 8c0-3.3-2.7-6-6-6s-6 2.7-6 6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-slate-700 font-bold text-xl mb-2">
                    All caught up!
                  </h3>
                  <p className="text-slate-500 text-base">
                    You have no new notifications at the moment.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100/50">
                  {notifications
                    .slice(0, isExpanded ? notifications.length : 5)
                    .map((n) => {
                      const theme = getNotificationTheme(n.type);
                      return (
                        <div
                          key={n._id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleOpenNotification(n)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                              handleOpenNotification(n);
                          }}
                          className={`block p-6 hover:bg-slate-50/60 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-slate-50/40 ${
                            !n.isRead
                              ? `${theme.bg} ${theme.border} border-l-4`
                              : ""
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start space-x-4">
                                {/* Enhanced unread indicator */}
                                {!n.isRead && (
                                  <div
                                    className={`w-3 h-3 ${theme.dot} rounded-full mt-2 flex-shrink-0 shadow-sm`}
                                  />
                                )}

                                {/* Icon with themed background */}
                                <div
                                  className={`w-10 h-10 ${theme.iconBg} rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}
                                >
                                  <div className={theme.iconColor}>
                                    {getNotificationIcon(n.type)}
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  {/* Type label */}
                                  <div className="flex items-center space-x-2 mb-3">
                                    <span
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${theme.badge}`}
                                    >
                                      {formatTypeLabel(n.type)}
                                    </span>
                                  </div>

                                  {/* Message */}
                                  <p className="text-slate-800 font-semibold leading-relaxed mb-3 text-base">
                                    {n.message}
                                  </p>

                                  {/* Timestamp */}
                                  <div className="flex items-center space-x-2">
                                    <svg
                                      className="w-4 h-4 text-slate-400"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                    >
                                      <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        strokeWidth="1.5"
                                      />
                                      <polyline
                                        points="12,6 12,12 16,14"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                    <p className="text-xs text-slate-500 font-medium">
                                      {timeAgoOrDate(n.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Arrow indicator */}
                            <div className="ml-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-1">
                              <svg
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <path
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 18l6-6-6-6"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {!isExpanded && notifications.length > 5 && (
                <div className="p-6 text-center border-t border-slate-100/50 bg-gradient-to-b from-slate-50/30 to-white">
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-blue-50/50"
                  >
                    <span>
                      Show {notifications.length - 5} more notifications
                    </span>
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationDemo;
