import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "@untitledui/icons";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCategories } from "../categories/hooks";

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"], {
    errorMap: () => ({ message: "Transaction type is required" }),
  }),
  amount: z
    .string()
    .refine(
      (val) => val && !isNaN(Number(val)) && Number(val) > 0,
      "Amount must be greater than 0",
    )
    .transform((val) => parseFloat(val)),
  date: z.union([z.string(), z.date()])
    .refine((val) => Boolean(val), 'Date is required')
    .transform((val) => {
        return format(val, 'yyyy-MM-dd');
    }),
  categoryId: z
    .string()
    .refine((val) => val && val.length > 0, "Category is required"),
  note: z
    .string()
    .max(200, "Note must be 200 characters or less")
    .optional()
    .or(z.literal("")),
});

export default function TransactionForm({
  isOpen,
  onClose,
  onSubmit,
  transaction,
  isSubmitting,
}) {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || "EXPENSE",
      amount: transaction?.amount ? String(transaction.amount) : "",
      date: transaction?.date ? parseISO(transaction.date) : new Date(),
      categoryId: transaction?.categoryId ? String(transaction.categoryId) : "",
      note: transaction?.note || "",
    },
  });

  const watchType = watch("type");
  const watchDate = watch("date");
  const watchAmount = watch("amount");
  const watchCategoryId = watch("categoryId");
  const watchNote = watch("note");

  const handleFormSubmit = async (formData) => {
    setServerError(null);
    try {
      const payload = {
        type: formData.type,
        amount: formData.amount,
        date:
          formData.date instanceof Date
            ? format(formData.date, "yyyy-MM-dd")
            : formData.date,
        categoryId: Number(formData.categoryId),
        note: formData.note || null,
      };
      await onSubmit(payload);
      reset();
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.error || "Failed to save transaction");
    }
  };

  if (!isOpen) return null;

  if (categoriesLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Add Transaction
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            You need to create at least one category before adding transactions.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Close
            </button>
            <a
              href="/categories"
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-solid hover:bg-brand-solid/90 rounded-lg inline-block"
            >
              Create Category
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {transaction ? "Edit Transaction" : "Add Transaction"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Type Segmented Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="flex gap-2">
              {["INCOME", "EXPENSE"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue("type", t)}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition ${
                    watchType === t
                      ? "bg-brand-solid text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t === "INCOME" ? "Income" : "Expense"}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("amount")}
                autoFocus
                className="w-full pl-7 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-600 mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              max={format(new Date(), "yyyy-MM-dd")}
              value={
                watchDate instanceof Date ? format(watchDate, "yyyy-MM-dd") : ""
              }
              onChange={(e) => setValue("date", new Date(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.date && (
              <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={watchCategoryId}
              onChange={(e) => setValue("categoryId", e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select category...</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-sm text-red-600 mt-1">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Groceries at supermarket"
              {...register("note")}
              maxLength="200"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">{watchNote.length}/200</p>
            {errors.note && (
              <p className="text-sm text-red-600 mt-1">{errors.note.message}</p>
            )}
          </div>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

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
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-solid hover:bg-brand-solid/90 rounded-lg disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : transaction
                  ? "Save Changes"
                  : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
