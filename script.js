// LocalStorage Keys
const USERS_KEY = 'nexus_bank_users';
const CURRENT_USER_KEY = 'nexus_bank_current_user';

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginBox = document.getElementById('login-box');
const signupBox = document.getElementById('signup-box');

const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

const userInfoNav = document.getElementById('user-info-nav');
const navUserName = document.getElementById('nav-user-name');
const dashUserName = document.getElementById('dash-user-name');
const logoutBtn = document.getElementById('logout-btn');

// Balance Elements
const totalBalanceEl = document.getElementById('total-balance');
const totalDepositEl = document.getElementById('total-deposit');
const totalWithdrawEl = document.getElementById('total-withdraw');

// Action Elements
const depositAmountInput = document.getElementById('deposit-amount');
const withdrawAmountInput = document.getElementById('withdraw-amount');
const depositBtn = document.getElementById('deposit-btn');
const withdrawBtn = document.getElementById('withdraw-btn');
const transactionList = document.getElementById('transaction-list');

// Loan Calculator Elements
const calcLoanBtn = document.getElementById('calc-loan-btn');

// App State
let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
let currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  if (currentUser) {
    renderDashboard();
  } else {
    showAuthSection();
  }
});

// Toggle Auth Forms
showSignupBtn.addEventListener('click', (e) => {
  e.preventDefault();
  loginBox.classList.add('hidden');
  signupBox.classList.remove('hidden');
});

showLoginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  signupBox.classList.add('hidden');
  loginBox.classList.remove('hidden');
});

// Signup Logic
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const password = document.getElementById('signup-password').value;
  const initialBalance = parseFloat(document.getElementById('signup-balance').value);

  // Check if user exists
  const userExists = users.some(u => u.email === email);
  if (userExists) {
    alert('এই ইমেইল দিয়ে ইতিমধ্যে একটি একাউন্ট খোলা হয়েছে!');
    return;
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    balance: initialBalance,
    totalDeposit: initialBalance,
    totalWithdraw: 0,
    transactions: [
      { type: 'Deposit', amount: initialBalance, date: new Date().toLocaleDateString('bn-BD') }
    ]
  };

  users.push(newUser);
  saveUsers();

  currentUser = newUser;
  saveCurrentUser();

  signupForm.reset();
  renderDashboard();
});

// Login Logic
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    currentUser = user;
    saveCurrentUser();
    loginForm.reset();
    renderDashboard();
  } else {
    alert('ভুল ইমেইল অথবা পাসওয়ার্ড দিয়েছেন!');
  }
});

// Logout Logic
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem(CURRENT_USER_KEY);
  showAuthSection();
});

// Deposit Logic
depositBtn.addEventListener('click', () => {
  const amount = parseFloat(depositAmountInput.value);

  if (isNaN(amount) || amount <= 0) {
    alert('সঠিক পরিমাণ টাকা ইনপুট দিন!');
    return;
  }

  currentUser.balance += amount;
  currentUser.totalDeposit += amount;
  currentUser.transactions.unshift({
    type: 'Deposit',
    amount: amount,
    date: new Date().toLocaleDateString('bn-BD')
  });

  updateUserData();
  depositAmountInput.value = '';
});

// Withdraw Logic
withdrawBtn.addEventListener('click', () => {
  const amount = parseFloat(withdrawAmountInput.value);

  if (isNaN(amount) || amount <= 0) {
    alert('সঠিক পরিমাণ টাকা ইনপুট দিন!');
    return;
  }

  if (amount > currentUser.balance) {
    alert('আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই!');
    return;
  }

  currentUser.balance -= amount;
  currentUser.totalWithdraw += amount;
  currentUser.transactions.unshift({
    type: 'Withdraw',
    amount: amount,
    date: new Date().toLocaleDateString('bn-BD')
  });

  updateUserData();
  withdrawAmountInput.value = '';
});

// Loan Calculator Logic
if (calcLoanBtn) {
  calcLoanBtn.addEventListener('click', () => {
    const principal = parseFloat(document.getElementById('loan-amount').value);
    const annualRate = parseFloat(document.getElementById('loan-rate').value);
    const months = parseInt(document.getElementById('loan-months').value);

    if (isNaN(principal) || principal <= 0 || 
        isNaN(annualRate) || annualRate <= 0 || 
        isNaN(months) || months <= 0) {
      alert('অনুগ্ৰহ করে লোনের তথ্য সঠিকভাবে পূরণ করুন!');
      return;
    }

    const monthlyRate = (annualRate / 100) / 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    document.getElementById('emi-result').textContent = emi.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('total-interest-result').textContent = totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('total-payment-result').textContent = totalPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  });
}

// Update User Data in State & Storage
function updateUserData() {
  const index = users.findIndex(u => u.id === currentUser.id);
  if (index !== -1) {
    users[index] = currentUser;
    saveUsers();
    saveCurrentUser();
    renderDashboard();
  }
}

// Render Dashboard View
function renderDashboard() {
  authSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
  userInfoNav.classList.remove('hidden');

  navUserName.textContent = currentUser.name;
  dashUserName.textContent = currentUser.name;

  totalBalanceEl.textContent = currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 });
  totalDepositEl.textContent = currentUser.totalDeposit.toLocaleString('en-US', { minimumFractionDigits: 2 });
  totalWithdrawEl.textContent = currentUser.totalWithdraw.toLocaleString('en-US', { minimumFractionDigits: 2 });

  // Render Transactions
  transactionList.innerHTML = '';
  if (currentUser.transactions.length === 0) {
    transactionList.innerHTML = '<li>কোন লেনদেন তথ্য পাওয়া যায়নি।</li>';
  } else {
    currentUser.transactions.forEach(txn => {
      const li = document.createElement('li');
      const isDeposit = txn.type === 'Deposit';
      li.className = isDeposit ? 'txn-deposit' : 'txn-withdraw';
      li.innerHTML = `
        <span>${isDeposit ? 'জমা' : 'উত্তোলন'} (${txn.date})</span>
        <strong>${isDeposit ? '+' : '-'} ৳ ${txn.amount.toLocaleString('en-US')}</strong>
      `;
      transactionList.appendChild(li);
    });
  }
}

// Show Auth View
function showAuthSection() {
  dashboardSection.classList.add('hidden');
  userInfoNav.classList.add('hidden');
  authSection.classList.remove('hidden');
  loginBox.classList.remove('hidden');
  signupBox.classList.add('hidden');
}

// Storage Helpers
function saveUsers() {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveCurrentUser() {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
                             }
