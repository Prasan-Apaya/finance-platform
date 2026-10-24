import React from 'react';
import { X } from '@untitledui/icons';

export default function DeleteConfirmDialog({ isOpen, onClose, onConfirm, transaction, isDeleting }) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Delete Transaction</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete this transaction?
        </p>

        <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Date:</span>
            <span className="font-medium text-gray-900">{transaction.dateFormatted}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Category:</span>
            <span className="font-medium text-gray-900">{transaction.categoryName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount:</span>
            <span className="font-medium text-gray-900">
              ₹{transaction.amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-6">This action cannot be undone.</p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
