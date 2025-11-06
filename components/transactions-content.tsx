"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search as SearchIcon,
  CreditCard,
  Wallet,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { adminService } from "@/services/adminService";

// Apple-style Transactions page
// - Tailwind CSS required
// - Uses adminService.getPayments(params) to fetch data
// - Drop this file into a page (e.g. /pages/admin/transactions.tsx or app/admin/transactions/page.tsx)

export default function TransactionsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | "">("");
  const [method, setMethod] = useState<string | "">("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      status: status || undefined,
      paymentMethod: method || undefined,
    }),
    [page, limit, search, status, method]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await adminService.getPayments(params);
        if (cancelled) return;
        if (res.success) {
          setPayments(res.data.payments || []);
          setTotalPages(res.data.pagination?.totalPages || 1);
        } else {
          setError(res.error || "Failed to load payments");
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error(err);
        setError(err?.message || "Failed to load payments");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [params]);

  function formatCurrency(n: number) {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(n);
    } catch {
      return `$${n.toFixed(2)}`;
    }
  }

  function formatDate(d: string | Date) {
    const date = new Date(d);
    return date.toLocaleString();
  }

  return (
    <div className="min-h-screen p-8 bg-[linear-gradient(180deg,#f5f7fb,white)]">
      <div className="max- mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Transactions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review and manage all payments. Clean, concise Apple-like UI.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur rounded-full px-3 py-1 shadow-sm">
              <SearchIcon className="w-4 h-4 text-slate-600" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search transaction id, user or tender"
                className="w-72 bg-transparent outline-none text-sm text-slate-700"
              />
            </div>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
            >
              <option value="">All status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={method}
              onChange={(e) => {
                setMethod(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
            >
              <option value="">All methods</option>
              <option value="credit_card">Credit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="wallet">Wallet</option>
              <option value="tap_gateway">Tap Gateway</option>
            </select>
          </div>
        </motion.div>

        {/* Cards summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-white shadow-[0_6px_20px_rgba(12,15,25,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Total payments</p>
                <p className="text-xl font-semibold text-slate-900">
                  {payments.length}
                </p>
              </div>
              <CreditCard className="w-7 h-7 text-slate-700/90" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white shadow-[0_6px_20px_rgba(12,15,25,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Completed</p>
                <p className="text-xl font-semibold text-slate-900">
                  {payments.filter((p) => p.status === "completed").length}
                </p>
              </div>
              <Wallet className="w-7 h-7 text-slate-700/90" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white shadow-[0_6px_20px_rgba(12,15,25,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Volume</p>
                <p className="text-xl font-semibold text-slate-900">
                  {formatCurrency(
                    payments.reduce((s, p) => s + (Number(p.amount) || 0), 0)
                  )}
                </p>
              </div>
              <Calendar className="w-7 h-7 text-slate-700/90" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-transparent">
          <div className="rounded-2xl overflow-hidden border border-slate-100 bg-white">
            <table className="min-w-full table-auto">
              <thead className="bg-white">
                <tr>
                  <th className="text-left px-6 py-3 text-sm text-slate-500">
                    Transaction
                  </th>
                  <th className="text-left px-6 py-3 text-sm text-slate-500">
                    User
                  </th>
                  <th className="text-left px-6 py-3 text-sm text-slate-500">
                    Tender
                  </th>
                  <th className="text-right px-6 py-3 text-sm text-slate-500">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-sm text-slate-500">
                    Method
                  </th>
                  <th className="text-left px-6 py-3 text-sm text-slate-500">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm text-slate-500">
                    Date
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-sm text-slate-500"
                    >
                      Loading…
                    </td>
                  </tr>
                )}

                {!loading && payments.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-sm text-slate-500"
                    >
                      No transactions found
                    </td>
                  </tr>
                )}

                {payments.map((p) => (
                  <motion.tr
                    key={p._id}
                    whileHover={{ scale: 1.001 }}
                    className="border-t last:border-b hover:bg-slate-50 cursor-pointer"
                    onClick={() => setSelectedPayment(p)}
                  >
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                      {p.transactionId}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {p.user?.email || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {p.tender?.title || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-slate-800">
                      {formatCurrency(Number(p.amount) || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                      {p.paymentMethod?.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          p.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPayment(p);
                        }}
                        className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm bg-white border border-slate-100 shadow-sm"
                      >
                        View
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-white border border-slate-100 shadow-sm disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-white border border-slate-100 shadow-sm disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer / Modal for payment details */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelectedPayment(null)}
          />

          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className="relative w-full sm:max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Transaction
                  </h3>
                  <p className="text-sm text-slate-500">
                    {selectedPayment.transactionId}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="rounded-full p-2 bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500">Amount</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(Number(selectedPayment.amount) || 0)}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="font-medium capitalize">
                    {selectedPayment.status}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500">Method</p>
                  <p className="font-medium capitalize">
                    {selectedPayment.paymentMethod}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="font-medium">
                    {formatDate(selectedPayment.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-800">User</h4>
                <div className="mt-2 p-3 rounded-lg bg-white border border-slate-100">
                  <p className="text-sm text-slate-700">
                    {selectedPayment.user?.email || "—"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedPayment.user?._id}
                  </p>
                </div>
              </div>

              {selectedPayment.tender && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-slate-800">
                    Tender
                  </h4>
                  <div className="mt-2 p-3 rounded-lg bg-white border border-slate-100">
                    <p className="text-sm text-slate-700">
                      {selectedPayment.tender?.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Posted by:{" "}
                      {selectedPayment.tender?.postedBy?.email || "—"}
                    </p>
                  </div>
                </div>
              )}

              {selectedPayment.paymentDetails && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-slate-800">
                    Payment details
                  </h4>
                  <pre className="mt-2 p-3 rounded-lg bg-slate-50 text-xs text-slate-700 overflow-auto max-h-40">
                    {JSON.stringify(selectedPayment.paymentDetails, null, 2)}
                  </pre>
                </div>
              )}

          
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
