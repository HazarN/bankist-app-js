'use strict';

import { account1, account2, account3, account4 } from './data.js';

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const labelLoginFail = document.querySelector('.login-failed');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const accounts = [account1, account2, account3, account4];

let currentAccount;

/* const currencies = new Map([
  ["USD", "United States dollar"],
  ["EUR", "Euro"],
  ["GBP", "Pound sterling"],
]); */

const createUsernames = (accounts) => {
  accounts.forEach((account) => {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map((x) => x[0])
      .join('');
  });
};

/////////////////
// Calculate here

const calculateBalance = (account) => {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  return account.balance;
};

const calculateSummaries = (movements, interestRate) => {
  const income = movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  const outcome = movements
    .filter((mov) => mov <= 0)
    .reduce((acc, mov) => acc + mov, 0);

  const interest = movements
    .filter((mov) => mov > 0)
    .map((mov) => (mov * interestRate) / 100)
    .reduce((acc, int) => acc + int);

  return [income, outcome, interest];
};

///////////////
// Display here

const displayMovements = (movements) => {
  containerMovements.innerHTML = '';

  movements.forEach((movement, i) => {
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${movement}€</div>
      </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const displayBalance = (balance) => (labelBalance.textContent = `${balance}€`);

const displaySummaries = (summaries) => {
  labelSumIn.textContent = `${summaries[0]}€`;
  labelSumOut.textContent = `${Math.abs(summaries[1])}€`;
  labelSumInterest.textContent = `${summaries[2].toFixed(2)}€`;
};

const updateUI = (account) => {
  const balance = calculateBalance(currentAccount);
  const summaries = calculateSummaries(
    currentAccount.movements,
    currentAccount.interestRate
  );

  // movements,
  displayMovements(currentAccount.movements);

  // balance,
  displayBalance(balance);

  // and summaries
  displaySummaries(summaries);
};

document.addEventListener('DOMContentLoaded', () => {
  createUsernames(accounts);
});

/////////////////
// Event handlers

// Logging in
btnLogin.addEventListener('click', (e) => {
  // prevent the submission
  e.preventDefault();

  currentAccount = accounts.find(
    (account) => account.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    console.log('USER LOGGED IN');
    labelLoginFail.textContent = '';

    // Clearing the input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur(); // it removes the cursor blinking

    // Display the UI and welcome,
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    updateUI(currentAccount);
  } else {
    console.log('USER NOT LOGGED IN');
    labelLoginFail.textContent = 'Wrong PIN or user not found';
  }

  // Clearing the input fields
  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur(); // it removes the cursor blinking
});

btnTransfer.addEventListener('click', (e) => {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);

  const receviedAccount = accounts.find(
    (account) => account.username === inputTransferTo.value
  );

  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferAmount.blur();

  if (
    amount > 0 &&
    currentAccount.balance >= amount &&
    receviedAccount &&
    receviedAccount.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receviedAccount.movements.push(amount);

    updateUI(currentAccount);
  }
});

btnClose.addEventListener('click', (e) => {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (account) => account.username === currentAccount.username
    );

    console.log(index);

    // deletes the element at the index (mutates the array);
    accounts.splice(index, 1);

    // hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
  inputClosePin.blur();
});

btnLoan.addEventListener('click', (e) => {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov > amount * 0.1)
  ) {
    currentAccount.movements.push(amount);

    updateUI(currentAccount);
  }

  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});
