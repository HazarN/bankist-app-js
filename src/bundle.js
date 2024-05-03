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
let sorted = false;

/* const currencies = new Map([
  ["USD", "United States dollar"],
  ["EUR", "Euro"],
  ["GBP", "Pound sterling"],
]); */

const createUsernames = accounts => {
  accounts.forEach(account => {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(x => x[0])
      .join('');
  });
};

// Date operations

const dateOptions = {
  minute: 'numeric',
  hour: 'numeric',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  weekday: 'short',
}; // For Intl localization API

const addZeroPadding = dateType => {
  return `${dateType}`.padStart(2, 0);
};

const daysPassed = (date1, date2) => {
  return Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
};

/////////////////
// Calculate here

const calculateBalance = account => {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  return account.balance;
};

const calculateSummaries = (movements, interestRate) => {
  const income = movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  const outcome = movements
    .filter(mov => mov <= 0)
    .reduce((acc, mov) => acc + mov, 0);

  const interest = movements
    .filter(mov => mov > 0)
    .map(mov => (mov * interestRate) / 100)
    .reduce((acc, int) => acc + int);

  return [income, outcome, interest];
};

///////////////
// Display here

const displayMovementDate = (movementDate, locale) => {
  const y = movementDate.getFullYear();
  const m = addZeroPadding(movementDate.getMonth() + 1);
  const d = addZeroPadding(movementDate.getDate());

  const diff = daysPassed(new Date(), movementDate);

  switch (true) {
    case diff === 0:
      return 'Today';
    case diff === 1:
      return 'Yesterday';
    case diff <= 7:
      return `${diff} Days Ago`;
    default:
      return new Intl.DateTimeFormat(locale, dateOptions).format(movementDate);
  }
};

const displayMovements = (acc, sorted) => {
  containerMovements.innerHTML = '';

  const movementsCopy = sorted
    ? acc.movements.slice().sort((x, y) => x - y)
    : acc.movements;

  movementsCopy.forEach((movement, i) => {
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const displayedDate = displayMovementDate(new Date(acc.movementsDates[i]));

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayedDate}</div>
        <div class="movements__value">${movement}€</div>
      </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const displayBalance = balance => (labelBalance.textContent = `${balance}€`);

const displaySummaries = summaries => {
  labelSumIn.textContent = `${summaries[0]}€`;
  labelSumOut.textContent = `${Math.abs(summaries[1])}€`;
  labelSumInterest.textContent = `${summaries[2].toFixed(2)}€`;
};

const updateUI = account => {
  const balance = calculateBalance(currentAccount);
  const summaries = calculateSummaries(
    currentAccount.movements,
    currentAccount.interestRate
  );

  // movements,
  displayMovements(currentAccount, false);

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
btnLogin.addEventListener('click', e => {
  // prevent the submission
  e.preventDefault();

  currentAccount = accounts.find(
    account => account.username === inputLoginUsername.value
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

    // Calculating printing the time that logged in
    const now = new Date();
    labelDate.textContent = Intl.DateTimeFormat(
      currentAccount.locale,
      dateOptions
    ).format(now);

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

btnTransfer.addEventListener('click', e => {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);

  const receviedAccount = accounts.find(
    account => account.username === inputTransferTo.value
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
    currentAccount.movementsDates.push(new Date().toISOString());
    receviedAccount.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);
  }
});

btnClose.addEventListener('click', e => {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      account => account.username === currentAccount.username
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

btnLoan.addEventListener('click', e => {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov > amount * 0.1)) {
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);
  }

  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

btnSort.addEventListener('click', e => {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
