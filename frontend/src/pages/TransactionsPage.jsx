import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from '@untitledui/icons';
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '../features/transactions/hooks';
import { useCategories } from '../features/categories/hooks';
import { getCategoryColor } from '../lib/categoryColor';
import { formatDate, formatMonth, getCurrentMonth, getPreviousMonth, getNextMonth } from '../lib/format';
import MonthSwitcher from '../features/dashboard/MonthSwitcher';
import TransactionForm from '../features/transactions/TransactionForm';
import DeleteConfirmDialog from '../features/transactions/DeleteConfirmDialog';
import { DotsVertical, Edit02, Trash01 } from '@untitledui/icons';

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const month = searchParams.get('month') || getCurrentMonth();
  const categoryId = searchParams.get('categoryId') || '';
  const type = searchParams.get('type') || '';

  const filters = { month };
  const { data: transactions, isLoading, isError } = useTransactions(filters);
  const { data: categories } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const handleMonthChange = (newMonth) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      updated.set('month', newMonth);
      return updated;
    });
  };

  const handleCategoryChange = (value) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      if (value) {
        updated.set('categoryId', value);
      } else {
        updated.delete('categoryId');
      }
      return updated;
    });
  };

  const handleTypeChange = (value) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      if (value) {
        updated.set('type', value);
      } else {
        updated.delete('type');
      }
      return updated;
    });
  };

  const handleClearFilters = () => {
    setSearchParams({ month });
  };

  const handleOpenAddForm = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (tx) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = async (data) => {
    if (editingTransaction) {
      await updateMutation.mutateAsync({ id: editingTransaction.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleOpenDeleteDialog = (tx) => {
    setDeleteTarget(tx);
    setOpenMenuId(null);
  };

  // Filter transactions client-side since backend doesn't support filtering yet
  let filteredTransactions = transactions || [];
  if (categoryId) {
    filteredTransactions = filteredTransactions.filter((tx) => String(tx.categoryId) === categoryId);
  }
  if (type) {
    filteredTransactions = filteredTransactions.filter((tx) => tx.type === type);
  }

  // Build category map for display
  const categoryMap = {};
  if (categories) {
    categories.forEach((cat) => {
      categoryMap[cat.id] = cat.name;
    });
  }

  // Calculate summary
  const totalIncome = filteredTransactions
    .filter((tx) => tx.type === 'INCOME')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  const totalExpense = filteredTransactions
    .filter((tx) => tx.type === 'EXPENSE')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const hasActiveFilters = categoryId || type;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500">Track your income and expenses.</p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-solid px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-solid/90"
        >
          <Plus className="w-4 h-4" /> Add transaction
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <MonthSwitcher month={month} onMonthChange={handleMonthChange} />

          <div className="flex gap-3 flex-wrap items-center flex-1">
            {/* Category Filter */}
            <select
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All categories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {filteredTransactions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Income:</span>
              <span className="ml-2 font-semibold text-emerald-600 tabular-nums">
                +₹{totalIncome.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Total Expense:</span>
              <span className="ml-2 font-semibold text-gray-900 tabular-nums">
                ₹{totalExpense.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-12 text-center">
          <p className="text-gray-600 mb-4">Failed to load transactions.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-12 text-center">
          {hasActiveFilters ? (
            <>
              <p className="text-gray-600 mb-4">No transactions match these filters.</p>
              <button onClick={handleClearFilters} className="text-sm text-primary hover:underline">
                Clear filters
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-4">No transactions for {formatMonth(month)}.</p>
              <button
                onClick={handleOpenAddForm}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-solid px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus className="w-4 h-4" /> Add transaction
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  const categoryName = categoryMap[tx.categoryId] || 'Unknown';
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(tx.date)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${getCategoryColor(tx.categoryId)}`} />
                          <span className="text-sm text-gray-900">{categoryName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={tx.note || ''}>
                        {tx.note || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`text-sm font-medium tabular-nums ${
                            isIncome ? 'text-emerald-600' : 'text-gray-900'
                          }`}
                        >
                          {isIncome ? '+' : ''}₹{Number(tx.amount).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === tx.id ? null : tx.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          >
                            <DotsVertical className="w-5 h-5" />
                          </button>
                          {openMenuId === tx.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                <button
                                  onClick={() => handleOpenEditForm(tx)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Edit02 className="w-4 h-4" /> Edit
                                </button>
                                <button
                                  onClick={() => handleOpenDeleteDialog(tx)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash01 className="w-4 h-4" /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden divide-y divide-gray-100">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              const categoryName = categoryMap[tx.categoryId] || 'Unknown';
              return (
                <div key={tx.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${getCategoryColor(tx.categoryId)}`} />
                      <span className="text-sm font-medium text-gray-900">{categoryName}</span>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === tx.id ? null : tx.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <DotsVertical className="w-5 h-5" />
                      </button>
                      {openMenuId === tx.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                            <button
                              onClick={() => handleOpenEditForm(tx)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit02 className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() => handleOpenDeleteDialog(tx)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash01 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{formatDate(tx.date)}</p>
                  {tx.note && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{tx.note}</p>}
                  <p
                    className={`text-base font-semibold tabular-nums ${
                      isIncome ? 'text-emerald-600' : 'text-gray-900'
                    }`}
                  >
                    {isIncome ? '+' : ''}₹{Number(tx.amount).toLocaleString('en-IN')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        transaction={editingTransaction}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        transaction={
          deleteTarget
            ? {
                ...deleteTarget,
                dateFormatted: formatDate(deleteTarget.date),
                categoryName: categoryMap[deleteTarget.categoryId] || 'Unknown',
              }
            : null
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
