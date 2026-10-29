import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from '@untitledui/icons';
import { useCategories } from '../categories/hooks';
import { getCategoryColor } from '../../lib/categoryColor';

const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Please select a category'),
  limitAmount: z
    .number({ invalid_type_error: 'Limit must be a number' })
    .positive('Limit must be greater than 0'),
});

export default function BudgetFormModal({ isOpen, onClose, onSubmit, budget, isSubmitting, existingCategoryIds }) {
  const { data: categories } = useCategories();
  const [hint, setHint] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(budgetSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (budget) {
        reset({ categoryId: String(budget.categoryId), limitAmount: budget.limitAmount });
      } else {
        reset({ categoryId: '', limitAmount: undefined });
      }
      setHint('');
    }
  }, [isOpen, budget, reset]);

  useEffect(() => {
    if (categories && !budget && existingCategoryIds !== undefined) {
      const availableCategories = categories.filter((c) => !existingCategoryIds.includes(c.id));
      if (availableCategories.length === 0) {
        setHint('All categories already have a budget for this month');
      } else {
        setHint('');
      }
    }
  }, [categories, budget, existingCategoryIds]);

  const onFormSubmit = async (formData) => {
    try {
      await onSubmit({
        categoryId: Number(formData.categoryId),
        limitAmount: Number(formData.limitAmount),
      });
      reset();
    } catch (err) {
      if (err.response?.status === 409) {
        setError('categoryId', { type: 'server', message: 'This category already has a budget for the month' });
      } else {
        setError('limitAmount', { type: 'server', message: err.response?.data?.message || 'An error occurred' });
      }
    }
  };

  if (!isOpen) return null;

  // Build options from categories that don't have budgets yet (for add mode) or all categories (for edit)
  const categoryOptions = categories?.filter((c) => {
    if (budget) return c.id === budget.categoryId;
    return !existingCategoryIds?.includes(c.id);
  }) || [];

  const isEdit = !!budget;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Budget' : 'Add Budget'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isEdit ? 'Category' : 'Category'}
            </label>
            {isEdit ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <span className={`w-3 h-3 rounded-full ${getCategoryColor(budget.categoryId)}`} />
                <span className="text-gray-900">{budget.categoryName}</span>
              </div>
            ) : (
              <>
                <select
                  {...register('categoryId')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={categoryOptions.length === 0}
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {hint && <p className="text-sm text-gray-500 mt-1">{hint}</p>}
                {errors.categoryId && (
                  <p className="text-sm text-red-600 mt-1">{errors.categoryId.message}</p>
                )}
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Limit</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                {...register('limitAmount', { valueAsNumber: true })}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>
            {errors.limitAmount && (
              <p className="text-sm text-red-600 mt-1">{errors.limitAmount.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (categoryOptions.length === 0 && !isEdit)}
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-solid hover:bg-brand-solid/90 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}