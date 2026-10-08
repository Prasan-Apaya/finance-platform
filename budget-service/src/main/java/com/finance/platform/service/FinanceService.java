package com.finance.platform.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.finance.platform.dto.BudgetRequest;
import com.finance.platform.dto.BudgetResponse;
import com.finance.platform.dto.BudgetStatusItem;
import com.finance.platform.dto.BudgetStatusResponse;
import com.finance.platform.dto.CategoryRequest;
import com.finance.platform.dto.CategoryResponse;
import com.finance.platform.dto.SummaryResponse;
import com.finance.platform.dto.TransactionRequest;
import com.finance.platform.dto.TransactionResponse;
import com.finance.platform.entity.Budget;
import com.finance.platform.entity.Category;
import com.finance.platform.entity.Transaction;
import com.finance.platform.entity.TransactionType;
import com.finance.platform.entity.User;
import com.finance.platform.exception.ResourceNotFoundException;
import com.finance.platform.repository.BudgetRepository;
import com.finance.platform.repository.CategoryRepository;
import com.finance.platform.repository.TransactionRepository;
import com.finance.platform.repository.UserRepository;

@Service
public class FinanceService {

	private static final BigDecimal ZERO = BigDecimal.ZERO;

	private final UserRepository userRepository;
	private final CategoryRepository categoryRepository;
	private final TransactionRepository transactionRepository;
	private final BudgetRepository budgetRepository;

	public FinanceService(UserRepository userRepository, CategoryRepository categoryRepository,
			TransactionRepository transactionRepository, BudgetRepository budgetRepository) {
		this.userRepository = userRepository;
		this.categoryRepository = categoryRepository;
		this.transactionRepository = transactionRepository;
		this.budgetRepository = budgetRepository;
	}

	@Transactional(readOnly = true)
	public List<CategoryResponse> getCategories(Long userId) {
		requireUser(userId);
		return categoryRepository.findAllByUser_IdOrderByNameAsc(userId).stream()
				.map(this::toCategoryResponse).toList();
	}

	@Transactional
	public CategoryResponse createCategory(Long userId, CategoryRequest request) {
		User user = requireUser(userId);
		String name = request.name().trim();
		if (categoryRepository.existsByUser_IdAndNameIgnoreCase(userId, name)) {
			throw new IllegalArgumentException("A category with this name already exists");
		}
		return toCategoryResponse(categoryRepository.save(new Category(user, name)));
	}

	@Transactional
	public CategoryResponse updateCategory(Long userId, Long id, CategoryRequest request) {
		Category category = requireCategory(userId, id);
		String name = request.name().trim();
		if (!category.getName().equalsIgnoreCase(name)
				&& categoryRepository.existsByUser_IdAndNameIgnoreCase(userId, name)) {
			throw new IllegalArgumentException("A category with this name already exists");
		}
		category.setName(name);
		return toCategoryResponse(categoryRepository.save(category));
	}

	@Transactional
	public void deleteCategory(Long userId, Long id) {
		Category category = requireCategory(userId, id);
		if (transactionRepository.existsByCategory_Id(id) || budgetRepository.existsByCategory_Id(id)) {
			throw new IllegalArgumentException("Cannot delete a category used by a transaction or budget");
		}
		categoryRepository.delete(category);
	}

	@Transactional(readOnly = true)
	public List<TransactionResponse> getTransactions(Long userId, Optional<YearMonth> month) {
		requireUser(userId);
		List<Transaction> transactions = month
				.map(value -> transactionRepository.findAllByUser_IdAndDateBetweenOrderByDateDescIdDesc(
						userId, value.atDay(1), value.atEndOfMonth()))
				.orElseGet(() -> transactionRepository.findAllByUser_IdOrderByDateDescIdDesc(userId));
		return transactions.stream().map(this::toTransactionResponse).toList();
	}

	@Transactional
	public TransactionResponse createTransaction(Long userId, TransactionRequest request) {
		User user = requireUser(userId);
		Category category = requireCategory(userId, request.categoryId());
		return toTransactionResponse(transactionRepository.save(new Transaction(user, category,
				request.amount(), request.type(), request.date(), request.note())));
	}

	@Transactional
	public TransactionResponse updateTransaction(Long userId, Long id, TransactionRequest request) {
		Transaction transaction = requireTransaction(userId, id);
		Category category = requireCategory(userId, request.categoryId());
		transaction.setCategory(category);
		transaction.setAmount(request.amount());
		transaction.setType(request.type());
		transaction.setDate(request.date());
		transaction.setNote(request.note());
		return toTransactionResponse(transactionRepository.save(transaction));
	}

	@Transactional
	public void deleteTransaction(Long userId, Long id) {
		transactionRepository.delete(requireTransaction(userId, id));
	}

	@Transactional
	public int importTransactions(Long userId, MultipartFile file) {
		User user = requireUser(userId);
		if (file.isEmpty()) {
			throw new IllegalArgumentException("CSV file must not be empty");
		}
		try (BufferedReader reader = new BufferedReader(
				new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
			String headerLine = reader.readLine();
			if (headerLine == null) {
				throw new IllegalArgumentException("CSV file must include a header row");
			}
			Map<String, Integer> columns = indexHeaders(parseCsvLine(headerLine));
			for (String required : List.of("categoryid", "amount", "type", "date")) {
				if (!columns.containsKey(required)) {
					throw new IllegalArgumentException("CSV is missing required column: " + required);
				}
			}

			List<Transaction> imported = new ArrayList<>();
			String line;
			int lineNumber = 1;
			while ((line = reader.readLine()) != null) {
				lineNumber++;
				if (line.isBlank()) {
					continue;
				}
				try {
					List<String> fields = parseCsvLine(line);
					Long categoryId = Long.valueOf(field(fields, columns, "categoryid"));
					Category category = requireCategory(userId, categoryId);
					BigDecimal amount = new BigDecimal(field(fields, columns, "amount"));
					TransactionType type = TransactionType.valueOf(
							field(fields, columns, "type").toUpperCase());
					LocalDate date = LocalDate.parse(field(fields, columns, "date"));
					String note = columns.containsKey("note")
							? optionalField(fields, columns, "note") : null;
					if (amount.signum() <= 0) {
						throw new IllegalArgumentException("amount must be greater than zero");
					}
					imported.add(new Transaction(user, category, amount, type, date, note));
				} catch (RuntimeException exception) {
					throw new IllegalArgumentException(
							"Invalid CSV data on line " + lineNumber + ": " + exception.getMessage(), exception);
				}
			}
			transactionRepository.saveAll(imported);
			return imported.size();
		} catch (IOException exception) {
			throw new IllegalArgumentException("Unable to read CSV file", exception);
		}
	}

	@Transactional(readOnly = true)
	public List<BudgetResponse> getBudgets(Long userId, Optional<YearMonth> month) {
		requireUser(userId);
		List<Budget> budgets = month
				.map(value -> budgetRepository.findAllByUser_IdAndMonthOrderByCategory_NameAsc(userId, value))
				.orElseGet(() -> budgetRepository.findAllByUser_IdOrderByMonthDescCategory_NameAsc(userId));
		return budgets.stream().map(this::toBudgetResponse).toList();
	}

	@Transactional
	public BudgetResponse createBudget(Long userId, BudgetRequest request) {
		User user = requireUser(userId);
		Category category = requireCategory(userId, request.categoryId());
		if (budgetRepository.findAllByUser_IdAndMonthOrderByCategory_NameAsc(userId, request.month())
				.stream().anyMatch(budget -> budget.getCategory().getId().equals(category.getId()))) {
			throw new IllegalArgumentException("A budget already exists for this category and month");
		}
		return toBudgetResponse(budgetRepository.save(
				new Budget(user, category, request.month(), request.limitAmount())));
	}

	@Transactional
	public BudgetResponse updateBudget(Long userId, Long id, BudgetRequest request) {
		Budget budget = requireBudget(userId, id);
		Category category = requireCategory(userId, request.categoryId());
		boolean duplicate = budgetRepository
				.findAllByUser_IdAndMonthOrderByCategory_NameAsc(userId, request.month()).stream()
				.anyMatch(existing -> !existing.getId().equals(id)
						&& existing.getCategory().getId().equals(category.getId()));
		if (duplicate) {
			throw new IllegalArgumentException("A budget already exists for this category and month");
		}
		budget.setCategory(category);
		budget.setMonth(request.month());
		budget.setLimitAmount(request.limitAmount());
		return toBudgetResponse(budgetRepository.save(budget));
	}

	@Transactional
	public void deleteBudget(Long userId, Long id) {
		budgetRepository.delete(requireBudget(userId, id));
	}

	@Transactional(readOnly = true)
	public BudgetStatusResponse getBudgetStatus(Long userId, YearMonth month) {
		requireUser(userId);
		List<Budget> budgets = budgetRepository
				.findAllByUser_IdAndMonthOrderByCategory_NameAsc(userId, month);
		Map<Long, BigDecimal> spentByCategory = new HashMap<>();
		transactionRepository.findAllByUser_IdAndDateBetweenAndType(userId, month.atDay(1),
				month.atEndOfMonth(), TransactionType.EXPENSE).forEach(transaction ->
						spentByCategory.merge(transaction.getCategory().getId(), transaction.getAmount(),
								BigDecimal::add));

		List<BudgetStatusItem> items = budgets.stream().map(budget -> {
			BigDecimal spent = spentByCategory.getOrDefault(budget.getCategory().getId(), ZERO);
			return new BudgetStatusItem(budget.getCategory().getId(), budget.getCategory().getName(),
					budget.getLimitAmount(), spent, budget.getLimitAmount().subtract(spent),
					spent.compareTo(budget.getLimitAmount()) > 0);
		}).toList();
		BigDecimal totalLimit = items.stream().map(BudgetStatusItem::limitAmount)
				.reduce(ZERO, BigDecimal::add);
		BigDecimal totalSpent = items.stream().map(BudgetStatusItem::spentAmount)
				.reduce(ZERO, BigDecimal::add);
		return new BudgetStatusResponse(userId, month, totalLimit, totalSpent,
				totalLimit.subtract(totalSpent), items);
	}

	@Transactional(readOnly = true)
	public SummaryResponse getSummary(Long userId, YearMonth month) {
		requireUser(userId);
		List<Transaction> transactions = transactionRepository
				.findAllByUser_IdAndDateBetweenOrderByDateDescIdDesc(
						userId, month.atDay(1), month.atEndOfMonth());
		BigDecimal income = transactions.stream()
				.filter(transaction -> transaction.getType() == TransactionType.INCOME)
				.map(Transaction::getAmount).reduce(ZERO, BigDecimal::add);
		BigDecimal expenses = transactions.stream()
				.filter(transaction -> transaction.getType() == TransactionType.EXPENSE)
				.map(Transaction::getAmount).reduce(ZERO, BigDecimal::add);
		return new SummaryResponse(userId, month, income, expenses, income.subtract(expenses),
				transactions.size());
	}

	private User requireUser(Long userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
	}

	private Category requireCategory(Long userId, Long categoryId) {
		return categoryRepository.findByIdAndUser_Id(categoryId, userId)
				.orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId));
	}

	private Transaction requireTransaction(Long userId, Long id) {
		return transactionRepository.findByIdAndUser_Id(id, userId)
				.orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));
	}

	private Budget requireBudget(Long userId, Long id) {
		return budgetRepository.findByIdAndUser_Id(id, userId)
				.orElseThrow(() -> new ResourceNotFoundException("Budget not found: " + id));
	}

	private CategoryResponse toCategoryResponse(Category category) {
		return new CategoryResponse(category.getId(), category.getUser().getId(), category.getName());
	}

	private TransactionResponse toTransactionResponse(Transaction transaction) {
		return new TransactionResponse(transaction.getId(), transaction.getUser().getId(),
				transaction.getCategory().getId(), transaction.getAmount(), transaction.getType(),
				transaction.getDate(), transaction.getNote());
	}

	private BudgetResponse toBudgetResponse(Budget budget) {
		return new BudgetResponse(budget.getId(), budget.getUser().getId(),
				budget.getCategory().getId(), budget.getCategory().getName(),
				budget.getMonth(), budget.getLimitAmount());
	}

	private Map<String, Integer> indexHeaders(List<String> headers) {
		Map<String, Integer> columns = new HashMap<>();
		for (int index = 0; index < headers.size(); index++) {
			columns.put(headers.get(index).trim().toLowerCase(), index);
		}
		return columns;
	}

	private String field(List<String> fields, Map<String, Integer> columns, String column) {
		int index = columns.get(column);
		if (index >= fields.size() || fields.get(index).isBlank()) {
			throw new IllegalArgumentException("column " + column + " must not be empty");
		}
		return fields.get(index).trim();
	}

	private String optionalField(List<String> fields, Map<String, Integer> columns, String column) {
		int index = columns.get(column);
		return index >= fields.size() || fields.get(index).isBlank() ? null : fields.get(index).trim();
	}

	private List<String> parseCsvLine(String line) {
		List<String> fields = new ArrayList<>();
		StringBuilder value = new StringBuilder();
		boolean quoted = false;
		for (int index = 0; index < line.length(); index++) {
			char character = line.charAt(index);
			if (character == '"') {
				if (quoted && index + 1 < line.length() && line.charAt(index + 1) == '"') {
					value.append('"');
					index++;
				} else {
					quoted = !quoted;
				}
			} else if (character == ',' && !quoted) {
				fields.add(value.toString());
				value.setLength(0);
			} else {
				value.append(character);
			}
		}
		if (quoted) {
			throw new IllegalArgumentException("unclosed quoted CSV field");
		}
		fields.add(value.toString());
		return fields;
	}
}
