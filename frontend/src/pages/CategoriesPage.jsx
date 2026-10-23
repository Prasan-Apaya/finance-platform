import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash01, Edit02, Plus, X } from '@untitledui/icons';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../features/categories/hooks';
import { getCategoryColor } from '../lib/categoryColor';

const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(40, 'Category name must be 40 characters or less')
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, 'Category name cannot be whitespace only'),
});

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionError, setActionError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categorySchema),
  });

  const openAddModal = () => {
    setEditingCategory(null);
    reset({ name: '' });
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    reset({ name: cat.name });
    setActionError(null);
    setIsModalOpen(true);
  };

  const onSubmit = async (formData) => {
    setActionError(null);
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...formData });
      } else {
        await createCategory.mutateAsync(formData);
      }
      setIsModalOpen(false);
      reset();
    } catch (err) {
      if (err.response?.status === 409) {
        setError('name', { type: 'server', message: err.response.data.message || 'Category name already exists' });
      } else {
        setActionError(err.response?.data?.message || 'An unexpected error occurred.');
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionError(null);
    try {
      await deleteCategory.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      // Keep delete dialog open on 409 error and show message
      if (err.response?.status === 409) {
        setActionError(err.response.data.message || 'This category has transactions and cannot be deleted.');
      } else {
        setActionError('Failed to delete category.');
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500">Manage your income and expense categories.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> Add category
        </button>
      </div>

      {/* Content State */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading categories...</div>
      ) : !categories || categories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-xs">
          <p className="text-gray-500 mb-4">No categories yet</p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus className="w-4 h-4" /> Add category
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs divide-y divide-gray-100">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${getCategoryColor(cat.id)}`} />
                <span className="font-medium text-gray-900">{cat.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  aria-label={`Rename ${cat.name}`}
                  onClick={() => openEditModal(cat)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <Edit02 className="w-4 h-4" />
                </button>
                <button
                  aria-label={`Delete ${cat.name}`}
                  onClick={() => { setDeleteTarget(cat); setActionError(null); }}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                >
                  <Trash01 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Rename Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Rename Category' : 'Add Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="e.g. Groceries"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
              </div>

              {actionError && <p className="text-sm text-red-600">{actionError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg disabled:opacity-50"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Category</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-semibold">{deleteTarget.name}</span>? This action cannot be undone.
            </p>

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {actionError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}