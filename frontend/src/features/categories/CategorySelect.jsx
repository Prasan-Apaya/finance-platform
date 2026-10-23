import React from 'react';
import { useCategories } from './hooks';

export function CategorySelect({ value, onChange, placeholder = "Select category..." }) {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return <div className="text-sm text-gray-500 py-2">Loading categories...</div>;
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <option value="" disabled>{placeholder}</option>
      {categories?.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}