const apiBaseUrl = 'http://localhost:3000'; 


function showError(message) {
    alert(message); 
}

function formatCurrency(amount) {
    return `$${parseFloat(amount).toFixed(2)}`;
}



// Login User
function loginUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                showError(data.error);
            } else {
                alert('Login successful!');
                window.location.href = 'dashboard.html';
            }
        })
        .catch((error) => showError('Login failed. Please try again.'));
}

function registerUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch(`${apiBaseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                showError(data.error);
            } else {
                alert('Registration successful!');
                window.location.href = 'login.html';
            }
        })
        .catch((error) => showError('Registration failed. Please try again.'));
}


function loadDashboard() {
    fetch('http://localhost:3000/dashboard-summary')
        .then(response => response.json())
        .then(data => {
            console.log('Dashboard Summary Data:', data);

            
            if (data && data.transactions && data.savings) {
                document.getElementById('totalIncome').textContent = `$${parseFloat(data.transactions.total_income || 0).toFixed(2)}`;
                document.getElementById('totalExpenses').textContent = `$${parseFloat(data.transactions.total_expenses || 0).toFixed(2)}`;
                document.getElementById('totalSavings').textContent = `$${parseFloat(data.savings.total_current || 0).toFixed(2)}`;
            } else {
                alert('Failed to load dashboard summary. Data missing.');
            }
        })
        .catch(error => {
            console.error('Error fetching dashboard summary:', error);
            alert('Failed to load dashboard summary.');
        });
}


function formatCurrency(amount) {
    return `$${parseFloat(amount).toFixed(2)}`;
}
function loadWeather() {

    fetch('https://api.open-meteo.com/v1/forecast?latitude=35&longitude=-78&current_weather=true')
        .then((response) => response.json())
        .then((data) => {
            const weather = data.current_weather.temperature + '°C, ' + data.current_weather.weathercode;
            document.getElementById('weather').textContent = `Weather: ${weather}`;
        })
        .catch((error) => {
            console.error('Failed to fetch weather data:', error);
            document.getElementById('weather').textContent = 'Weather: Unable to fetch';
        });
}
function loadTime() {
    setInterval(() => {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        document.getElementById('time').textContent = `Time: ${timeString}`;
    }, 1000);
}


function loadTransactions() {
    fetch(`${apiBaseUrl}/transactions`)
        .then((response) => response.json())
        .then((data) => {
            const tableBody = document.getElementById('transactionsTableBody');
            tableBody.innerHTML = '';

            data.forEach((transaction) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transaction.type}</td>
                    <td>${formatCurrency(transaction.amount)}</td>
                    <td>${transaction.description}</td>
                    <td>
                        <button class="text-red-500 hover:text-red-700" onclick="deleteTransaction(${transaction.id})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch((error) => showError('Failed to load transactions.'));
}

function addTransaction() {
    const type = document.getElementById('type').value;
    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;

    fetch(`${apiBaseUrl}/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, amount, description }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                showError(data.error);
            } else {
                alert('Transaction added successfully!');
                loadTransactions();
            }
        })
        .catch((error) => showError('Failed to add transaction.'));
}

function deleteTransaction(id) {
    fetch(`${apiBaseUrl}/transaction/${id}`, { method: 'DELETE' })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                showError(data.error);
            } else {
                alert('Transaction deleted successfully!');
                loadTransactions();
            }
        })
        .catch((error) => showError('Failed to delete transaction.'));
}


function loadSavings() {
    fetch(`${apiBaseUrl}/savings`)
        .then((response) => response.json())
        .then((data) => {
            const tableBody = document.getElementById('savingsTableBody');
            tableBody.innerHTML = '';

            data.forEach((saving) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${saving.name}</td>
                    <td>${formatCurrency(saving.target_amount)}</td>
                    <td>${formatCurrency(saving.current_amount)}</td>
                    <td>
                        <button class="text-red-500 hover:text-red-700" onclick="deleteSavings(${saving.id})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch((error) => showError('Failed to load savings.'));
}

function addSavings() {
    const name = document.getElementById('name').value;
    const targetAmount = document.getElementById('targetAmount').value;
    const currentAmount = document.getElementById('currentAmount').value;

    fetch(`${apiBaseUrl}/savings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, targetAmount, currentAmount }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                showError(data.error);
            } else {
                alert('Savings goal added successfully!');
                loadSavings();
            }
        })
        .catch((error) => showError('Failed to add savings.'));
}

function deleteSavings(id) {
    fetch(`${apiBaseUrl}/savings/${id}`, { method: 'DELETE' })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                showError(data.error);
            } else {
                alert('Savings goal deleted successfully!');
                loadSavings();
            }
        })
        .catch((error) => showError('Failed to delete savings.'));
}

if (document.readyState !== 'loading') {
    if (window.location.pathname.includes('dashboard.html')) loadDashboard();
    if (window.location.pathname.includes('transaction.html')) loadTransactions();
    if (window.location.pathname.includes('savings.html')) loadSavings();
}
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;

    if (currentPath.includes('dashboard.html')) {
        loadDashboard();
        loadWeather();
        loadTime();
    } else if (currentPath.includes('transaction.html')) {
        loadTransactions();
    } else if (currentPath.includes('savings.html')) {
        loadSavings();
    }
});
