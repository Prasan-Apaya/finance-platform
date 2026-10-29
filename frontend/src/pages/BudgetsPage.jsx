import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit02, Trash01, Copy01, DotsVertical } from '@untitledui/icons';
import { useBudgets, useBudgetStatus, useCreateBudget, useUpdateBudget, useDeleteBudget } from '../features/budgets/hooks';
import { useCategories } from '../features/categories/hooks';
import { getCategoryColor } from '../lib/categoryColor';
import { formatMonth, getCurrentMonth, getPreviousMonth } from '../lib/format';
import MonthSwitcher from '../features/dashboard/MonthSwitcher';
import BudgetFormModal from '../features/budgets/BudgetFormModal';
import DeleteConfirmDialog from '../features/budgets/DeleteConfirmDialog';

export default function BudgetsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [copyMessage, setCopyMessage] = useState(null);

  const month = searchParams.get('month') || getCurrentMonth();

  const { data: budgets, isLoading, isError } = useBudgets(month);
  const { data: categories } = useCategories();
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

  // Get budgets from previous month
  const prevMonth = getPreviousMonth(month);
  const { data: prevMonthBudgets } = useBudgets(prevMonth);

  // Get budget status
  const { data: budgetStatus } = useBudgetStatus(month);

  // Combine budgets with their spending data from status endpoint
  const combinedBudgets = useMemo(() => {
    if (!budgets || !budgetStatus?.items) return [];
    const statusMap = {};
    budgetStatus.items.forEach((cat) => {
      statusMap[cat.categoryId] = cat;
    });
    return budgets.map((b) => ({
      ...b,
      spent: statusMap[b.categoryId]?.spentAmount || 0,
      remaining: statusMap[b.categoryId]?.remainingAmount || b.limitAmount,
      overBudget: statusMap[b.categoryId]?.overBudget || false,
    }));
  }, [budgets, budgetStatus]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!combinedBudgets.length) return { totalBudget: 0, totalSpent: 0, totalRemaining: 0 };
    const totalBudget = combinedBudgets.reduce((sum, b) => sum + Number(b.limitAmount), 0);
    const totalSpent = combinedBudgets.reduce((sum, b) => sum + Number(b.spent), 0);
    const totalRemaining = totalBudget - totalSpent;
    return { totalBudget, totalSpent, totalRemaining };
  }, [combinedBudgets]);

  // Get category IDs that already have budgets this month
  const existingBudgetCategoryIds = useMemo(() => {
    return new Set((budgets || []).map((b) => b.categoryId));
  }, [budgets]);

  const handleMonthChange = (newMonth) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      updated.set('month', newMonth);
      return updated;
    });
    setOpenMenuId(null);
    setCopyMessage(null);
  };

  const handleOpenAddForm = () => {
    setEditingBudget(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBudget(null);
  };

  const handleSubmit = async (data) => {
    if (editingBudget) {
      await updateMutation.mutateAsync({ id: editingBudget.id, data });
    } else {
      await createMutation.mutateAsync({ ...data, month });
    }
    setIsFormOpen(false);
    setEditingBudget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleOpenDeleteDialog = (budget) => {
    setDeleteTarget(budget);
    setOpenMenuId(null);
  };

  const handleMenuToggle = (e, budgetId) => {
    if (openMenuId === budgetId) {
      setOpenMenuId(null);
      setMenuPosition(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setOpenMenuId(budgetId);
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right + window.scrollX,
      });
    }
  };

  const handleCopyFromLastMonth = async () => {
    if (!prevMonthBudgets || !prevMonthBudgets.length) return;

    // Filter out budgets that already exist for current month
    const toCreate = prevMonthBudgets.filter((pb) => !existingBudgetCategoryIds.has(pb.categoryId));

    if (toCreate.length === 0) {
      setCopyMessage('No new budgets to copy from last month');
      return;
    }

    try {
      // Run creates in parallel
      await Promise.all(
        toCreate.map((pb) =>
          createMutation.mutateAsync({
            categoryId: pb.categoryId,
            month,
            limitAmount: pb.limitAmount,
          })
        )
      );
      setCopyMessage(`${toCreate.length} budget${toCreate.length > 1 ? 's' : ''} copied from ${formatMonth(prevMonth)}`);
    } catch (err) {
      setCopyMessage('Some budgets could not be copied');
    }
  };

  const showCopyButton = !budgets || budgets.length === 0;

  // Helper to calculate status
  const getStatus = (spent, limit) => {
    if (limit <= 0) return 'OK';
    const percent = (spent / limit) * 100;
    if (percent >= 100) return 'EXCEEDED';
    if (percent >= 80) return 'WARNING';
    return 'OK';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-sm text-gray-500">Manage your monthly spending limits.</p>
        </div>
        {showCopyButton && (
          <button
            onClick={handleCopyFromLastMonth}
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Copy01 className="w-4 h-4" /> Copy from last month
          </button>
        )}
        {!showCopyButton && (
          <button
            onClick={handleOpenAddForm}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-solid px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-solid/90"
          >
            <Plus className="w-4 h-4" /> Add budget
          </button>
        )}
      </div>

      {/* Copy message */}
      {copyMessage && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          {copyMessage}
        </div>
      )}

      {/* Month Switcher */}
      <div className="mb-6">
        <MonthSwitcher month={month} onMonthChange={handleMonthChange} />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-12 text-center">
          <p className="text-gray-600 mb-4">Failed to load budgets.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      ) : combinedBudgets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-12 text-center">
          <p className="text-gray-600 mb-4">No budgets set for {formatMonth(month)}.</p>
          <div className="flex justify-center gap-3">
            {prevMonthBudgets && prevMonthBudgets.length > 0 && (
              <button
                onClick={handleCopyFromLastMonth}
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Copy01 className="w-4 h-4" /> Copy from last month
              </button>
            )}
            <button
              onClick={handleOpenAddForm}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-solid px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="w-4 h-4" /> Add budget
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Total Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 mb-6">
            <div className="text-sm text-gray-500 mb-2">Total Budget</div>
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-2xl font-bold text-gray-900">
                ₹{totals.totalBudget.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">Spent: <span className="font-medium text-gray-900">₹{totals.totalSpent.toLocaleString('en-IN')}</span></span>
              <span className={totals.totalRemaining >= 0 ? 'text-gray-900' : 'text-red-600'}>
                {totals.totalRemaining >= 0 ? `₹${totals.totalRemaining.toLocaleString('en-IN')} left` : `₹${Math.abs(totals.totalRemaining).toLocaleString('en-IN')} over`}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full">
              <div
                className="h-full rounded-full bg-brand-solid"
                style={{ width: `${Math.min((totals.totalSpent / totals.totalBudget) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Budget List */}
          <div className="space-y-3">
            {combinedBudgets.map((budget) => {
              const percentUsed = budget.limitAmount > 0 ? (budget.spent / budget.limitAmount) * 100 : 0;
              const clamped = Math.min(percentUsed, 100);
              const status = getStatus(budget.spent, budget.limitAmount);
              const remaining = budget.limitAmount - budget.spent;

              let barColor;
              if (status === 'EXCEEDED') barColor = 'bg-rose-500';
              else if (status === 'WARNING') barColor = 'bg-amber-500';
              else barColor = 'bg-emerald-500';

              return (
                <div key={budget.id} className="bg-white rounded-xl border border-gray-200 shadow-xs p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${getCategoryColor(budget.categoryId)}`} />
                      <span className="font-medium text-gray-900">{budget.categoryName}</span>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => handleMenuToggle(e, budget.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <DotsVertical className="w-5 h-5" />
                      </button>
                      {openMenuId === budget.id && menuPosition && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => {
                              setOpenMenuId(null);
                              setMenuPosition(null);
                            }}
                          />
                          <div
                            style={{
                              top: `${menuPosition.top}px`,
                              right: `${menuPosition.right}px`,
                            }}
                            className="fixed w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                          >
                            <button
                              onClick={() => handleOpenEditForm(budget)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit02 className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() => handleOpenDeleteDialog(budget)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash01 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 h-2 rounded-full mb-2">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      role="progressbar"
                      aria-valuenow={Math.round(percentUsed)}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      style={{ width: `${clamped}%` }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 tabular-nums">
                      ₹{budget.spent.toLocaleString('en-IN')} of ₹{Number(budget.limitAmount).toLocaleString('en-IN')}
                    </span>
                    <span className={`font-medium ${remaining >= 0 ? 'text-gray-700' : 'text-rose-600'}`}>
                      {remaining >= 0
                        ? `₹${remaining.toLocaleString('en-IN')} left`
                        : `₹${Math.abs(remaining).toLocaleString('en-IN')} over`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{Math.round(percentUsed)}% used</div>
                </div>
              );
            })}
          </div>

          {/* Add budget button at bottom when list exists */}
          {!showCopyButton && existingBudgetCategoryIds.size < (categories?.length || 0) && (
            <button
              onClick={handleOpenAddForm}
              className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add another budget
            </button>
          )}
        </>
      )}

      {/* Form Modal */}
      <BudgetFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        budget={editingBudget}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        existingCategoryIds={Array.from(existingBudgetCategoryIds)}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        budget={deleteTarget}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}