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

let currentAccount, timer;
let sorted = false;

const createUsernames = accounts => {
  accounts.forEach(account => {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(x => x[0])
      .join('');
  });
};

// Date and Number Internationalization Operations

const dateOptions = {
  minute: 'numeric',
  hour: 'numeric',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  weekday: 'short',
}; // For Intl localization API

const numberFormatting = (value, currency, locale) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

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
        <div class="movements__value">${numberFormatting(
          movement,
          acc.currency,
          acc.locale
        )}</div>
      </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const displayBalance = balance =>
  (labelBalance.textContent = numberFormatting(
    balance,
    currentAccount.currency,
    currentAccount.locale
  ));

const displaySummaries = summaries => {
  const [inc, outc, int] = summaries;

  labelSumIn.textContent = numberFormatting(
    inc,
    currentAccount.currency,
    currentAccount.locale
  );
  labelSumOut.textContent = numberFormatting(
    outc,
    currentAccount.currency,
    currentAccount.locale
  );
  labelSumInterest.textContent = numberFormatting(
    int,
    currentAccount.currency,
    currentAccount.locale
  );
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

const startLogOutTimer = () => {
  let counter = 120; // minutes

  const tick = () => {
    const mins = addZeroPadding(Math.trunc(counter / 60));
    const secs = addZeroPadding(counter % 60);
    labelTimer.textContent = `${mins}:${secs}`;

    if (counter === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    counter--;
  };

  tick(); // we need to call once, otherwise it stops when the timer is 1 (not 0)
  return setInterval(tick, 1000);
};

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

    // setting the timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

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

    clearInterval(timer);
    timer = startLogOutTimer();

    updateUI(currentAccount);
  }

  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferAmount.blur();
});

btnLoan.addEventListener('click', e => {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov > amount * 0.1)) {
    setTimeout(() => {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());

      clearInterval(timer);
      timer = startLogOutTimer();

      updateUI(currentAccount);
    }, 2500);
  }

  inputLoanAmount.value = '';
  inputLoanAmount.blur();
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

btnSort.addEventListener('click', e => {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
