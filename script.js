// ==========================================
// INTERACTIVE EXPENSE TRACKER
// ==========================================

// Get elements
const expenseForm = document.getElementById("expenseForm");

const expenseId = document.getElementById("expenseId");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");

const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");

const expenseList = document.getElementById("expenseList");
const emptyMessage = document.getElementById("emptyMessage");

const categoryFilter = document.getElementById("categoryFilter");
const dateFilter = document.getElementById("dateFilter");
const searchInput = document.getElementById("searchInput");
const resetFilters = document.getElementById("resetFilters");
const clearAll = document.getElementById("clearAll");

const totalExpense = document.getElementById("totalExpense");
const totalTransactions = document.getElementById("totalTransactions");
const averageExpense = document.getElementById("averageExpense");


// ==========================================
// LOAD EXPENSES FROM LOCAL STORAGE
// ==========================================

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];


// ==========================================
// SET TODAY'S DATE
// ==========================================

const today = new Date().toISOString().split("T")[0];

dateInput.value = today;


// ==========================================
// SAVE DATA
// ==========================================

function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}


// ==========================================
// FORMAT CURRENCY
// ==========================================

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(amount);
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date) {
    const dateObject = new Date(date + "T00:00:00");

    return dateObject.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// ==========================================
// ADD EXPENSE
// ==========================================

expenseForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;
    const description = descriptionInput.value.trim();

    // Validation
    if (!title) {
        alert("Please enter expense name.");
        return;
    }

    if (!amount || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    if (!category) {
        alert("Please select a category.");
        return;
    }

    if (!date) {
        alert("Please select a date.");
        return;
    }


    // ==========================================
    // EDIT EXISTING EXPENSE
    // ==========================================

    if (expenseId.value) {

        const index = expenses.findIndex(
            expense => expense.id === expenseId.value
        );

        if (index !== -1) {

            expenses[index] = {
                id: expenseId.value,
                title,
                amount,
                category,
                date,
                description
            };

            alert("Expense updated successfully!");
        }

    }

    // ==========================================
    // ADD NEW EXPENSE
    // ==========================================

    else {

        const newExpense = {
            id: Date.now().toString(),
            title,
            amount,
            category,
            date,
            description
        };

        expenses.push(newExpense);

        alert("Expense added successfully!");
    }


    // Save and refresh
    saveExpenses();

    resetForm();

    renderExpenses();

});


// ==========================================
// DISPLAY EXPENSES
// ==========================================

function renderExpenses() {

    const categoryValue = categoryFilter.value;
    const dateValue = dateFilter.value;
    const searchValue = searchInput.value.toLowerCase().trim();


    // Filter expenses
    let filteredExpenses = expenses.filter(expense => {

        const matchesCategory =
            categoryValue === "All" ||
            expense.category === categoryValue;

        const matchesDate =
            !dateValue ||
            expense.date === dateValue;

        const matchesSearch =
            expense.title.toLowerCase().includes(searchValue) ||
            expense.category.toLowerCase().includes(searchValue) ||
            expense.description.toLowerCase().includes(searchValue);

        return (
            matchesCategory &&
            matchesDate &&
            matchesSearch
        );

    });


    // Sort newest date first
    filteredExpenses.sort((a, b) => {

        if (a.date === b.date) {
            return Number(b.id) - Number(a.id);
        }

        return new Date(b.date) - new Date(a.date);

    });


    // Clear list
    expenseList.innerHTML = "";


    // Empty state
    if (filteredExpenses.length === 0) {

        emptyMessage.style.display = "block";

    } else {

        emptyMessage.style.display = "none";

    }


    // Create expense cards
    filteredExpenses.forEach(expense => {

        const card = document.createElement("div");

        card.className = "expense-card";


        card.innerHTML = `

            <div class="expense-info">

                <div class="expense-title">
                    ${escapeHTML(expense.title)}
                </div>

                ${
                    expense.description
                        ? `<div class="expense-description">
                            ${escapeHTML(expense.description)}
                           </div>`
                        : ""
                }

                <div class="expense-meta">

                    <span class="category-badge">
                        ${getCategoryIcon(expense.category)}
                        ${escapeHTML(expense.category)}
                    </span>

                    <span class="expense-date">
                        📅 ${formatDate(expense.date)}
                    </span>

                </div>

            </div>


            <div class="expense-amount">
                ${formatCurrency(expense.amount)}
            </div>


            <div class="expense-actions">

                <button
                    class="edit-btn small-btn"
                    onclick="editExpense('${expense.id}')"
                >
                    ✏️ Edit
                </button>

                <button
                    class="delete-btn small-btn"
                    onclick="deleteExpense('${expense.id}')"
                >
                    🗑️ Delete
                </button>

            </div>

        `;


        expenseList.appendChild(card);

    });


    updateSummary();

}


// ==========================================
// CATEGORY ICON
// ==========================================

function getCategoryIcon(category) {

    const icons = {

        Food: "🍔",
        Travel: "🚌",
        Shopping: "🛍️",
        Education: "📚",
        Entertainment: "🎮",
        Bills: "💡",
        Health: "🏥",
        Other: "📦"

    };

    return icons[category] || "📦";
}


// ==========================================
// UPDATE SUMMARY
// ==========================================

function updateSummary() {

    const total = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
    );

    const count = expenses.length;

    const average = count > 0
        ? total / count
        : 0;


    totalExpense.textContent = formatCurrency(total);

    totalTransactions.textContent = count;

    averageExpense.textContent = formatCurrency(average);

}


// ==========================================
// EDIT EXPENSE
// ==========================================

function editExpense(id) {

    const expense = expenses.find(
        expense => expense.id === id
    );

    if (!expense) {
        return;
    }


    expenseId.value = expense.id;

    titleInput.value = expense.title;

    amountInput.value = expense.amount;

    categoryInput.value = expense.category;

    dateInput.value = expense.date;

    descriptionInput.value = expense.description;


    formTitle.textContent = "Edit Expense";

    submitBtn.textContent = "💾 Update Expense";

    cancelBtn.classList.remove("hidden");


    // Scroll to form
    document
        .querySelector(".expense-form-section")
        .scrollIntoView({
            behavior: "smooth"
        });

}


// ==========================================
// DELETE EXPENSE
// ==========================================

function deleteExpense(id) {

    const expense = expenses.find(
        expense => expense.id === id
    );

    if (!expense) {
        return;
    }


    const confirmed = confirm(
        `Delete "${expense.title}" expense?`
    );


    if (!confirmed) {
        return;
    }


    expenses = expenses.filter(
        expense => expense.id !== id
    );


    saveExpenses();

    renderExpenses();

}


// ==========================================
// CLEAR ALL EXPENSES
// ==========================================

clearAll.addEventListener("click", function () {

    if (expenses.length === 0) {

        alert("There are no expenses to delete.");

        return;
    }


    const confirmed = confirm(
        "Are you sure you want to delete ALL expenses?"
    );


    if (!confirmed) {
        return;
    }


    expenses = [];

    saveExpenses();

    resetForm();

    renderExpenses();


    alert("All expenses have been deleted.");

});


// ==========================================
// CANCEL EDIT
// ==========================================

cancelBtn.addEventListener("click", function () {

    resetForm();

});


// ==========================================
// RESET FORM
// ==========================================

function resetForm() {

    expenseForm.reset();

    expenseId.value = "";

    dateInput.value = today;

    formTitle.textContent = "Add Expense";

    submitBtn.textContent = "➕ Add Expense";

    cancelBtn.classList.add("hidden");

}


// ==========================================
// FILTER EVENTS
// ==========================================

categoryFilter.addEventListener(
    "change",
    renderExpenses
);

dateFilter.addEventListener(
    "change",
    renderExpenses
);

searchInput.addEventListener(
    "input",
    renderExpenses
);


// ==========================================
// RESET FILTERS
// ==========================================

resetFilters.addEventListener("click", function () {

    categoryFilter.value = "All";

    dateFilter.value = "";

    searchInput.value = "";

    renderExpenses();

});


// ==========================================
// ESCAPE HTML
// Prevent HTML injection
// ==========================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ==========================================
// INITIAL RENDER
// ==========================================

renderExpenses();