import React from 'react';
import { Printer, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import BrandLogo from './BrandLogo';

const InvoiceModal = ({ isOpen, onClose, sale }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            <CheckCircle className="w-3.5 h-3.5" /> PAID
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
            <Clock className="w-3.5 h-3.5" /> PARTIAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" /> DUE
          </span>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tax Invoice Preview" maxWidth="max-w-3xl">
      <div className="flex justify-end gap-2 mb-4 no-print">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm shadow-sm transition"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      <div id="printable-invoice" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-200 dark:border-slate-700 pb-5 gap-4">
          <div>
            <BrandLogo size="md" showText={true} />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Main Market Commercial Complex, Sector 18, City Centre
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              GSTIN: 27AABCS1234F1Z9 | Phone: +91 98765 00000
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
              Retail Tax Invoice
            </span>
            <p className="text-lg font-bold font-mono text-gray-900 dark:text-white mt-0.5">
              {sale.invoiceNumber}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Date: {new Date(sale.createdAt).toLocaleString()}
            </p>
            <div className="mt-2">{getStatusBadge(sale.paymentStatus)}</div>
          </div>
        </div>

        {/* Bill To & Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs border-b border-gray-200 dark:border-slate-700">
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Customer Details
            </h4>
            {sale.customer ? (
              <div className="space-y-0.5 text-gray-600 dark:text-gray-300">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{sale.customer.name}</p>
                <p>Phone: {sale.customer.phone || 'N/A'}</p>
                {sale.customer.email && <p>Email: {sale.customer.email}</p>}
                {sale.customer.address && <p>Address: {sale.customer.address}</p>}
                <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                  Loyalty Points: {sale.customer.loyaltyPoints}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 italic">Walk-in Retail Customer</p>
            )}
          </div>

          <div className="sm:text-right space-y-0.5 text-gray-600 dark:text-gray-300">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Payment Information
            </h4>
            <p>Payment Mode: <span className="font-medium text-gray-900 dark:text-white uppercase">{sale.paymentMode}</span></p>
            <p>Cashier / Billed By: <span className="font-medium text-gray-900 dark:text-white">{sale.createdByUser?.name || 'Staff'}</span></p>
            {sale.notes && <p className="italic text-gray-500">Note: {sale.notes}</p>}
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 uppercase font-semibold">
                <th className="py-2.5">#</th>
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5 text-right">Unit Price</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {sale.items?.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-2.5 text-gray-400 font-mono">{idx + 1}</td>
                  <td className="py-2.5">
                    <p className="font-medium text-gray-900 dark:text-white">{item.product?.name || 'Item'}</p>
                    <p className="text-gray-400 text-[11px] font-mono">{item.product?.sku}</p>
                  </td>
                  <td className="py-2.5 text-right font-mono">₹{item.unitPrice?.toFixed(2)}</td>
                  <td className="py-2.5 text-center font-mono font-medium">
                    {item.quantity} {item.product?.unit || 'pcs'}
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold">₹{item.total?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Breakdown */}
        <div className="border-t border-gray-200 dark:border-slate-700 mt-4 pt-4 flex flex-col sm:flex-row justify-between gap-4 text-xs">
          <div className="max-w-xs text-gray-500 dark:text-gray-400 text-[11px]">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Terms & Conditions:</p>
            <p>1. Goods once sold can be exchanged within 7 days with original invoice.</p>
            <p>2. Warranty coverage as per official manufacturer terms.</p>
            <p className="mt-2 font-medium text-indigo-600 dark:text-indigo-400">Thank you for shopping with us!</p>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 font-mono">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Subtotal:</span>
              <span>₹{sale.subtotal?.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount:</span>
                <span>-₹{sale.discount?.toFixed(2)}</span>
              </div>
            )}
            {sale.taxAmount > 0 && (
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>GST ({sale.taxPercent}%):</span>
                <span>+₹{sale.taxAmount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-slate-700 pt-2">
              <span>Grand Total:</span>
              <span className="text-indigo-600 dark:text-indigo-400">₹{sale.grandTotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Paid Amount:</span>
              <span>₹{sale.paidAmount?.toFixed(2)}</span>
            </div>
            {sale.balanceAmount > 0 && (
              <div className="flex justify-between text-rose-600 dark:text-rose-400 font-semibold border-t border-dashed border-rose-200 dark:border-rose-900/50 pt-1">
                <span>Balance Due:</span>
                <span>₹{sale.balanceAmount?.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceModal;
