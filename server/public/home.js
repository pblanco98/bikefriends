const HOME_URL = 'http://localhost:5005/home'

fetch(HOME_URL)
.then(response => response.json())
.then(accounts => {
    const accountElement = document.querySelector('.account')
    accountElement.innerHTML = "";
    
    const headerRow = document.createElement("tr");

    const header = document.createElement("td");
    header.textContent = 'Username';

    const email = document.createElement("td");
    email.textContent = 'Email';

    const password = document.createElement("td")
    password.textContent = 'Password';

    const date = document.createElement("td")
    date.textContent = 'Date';
    
    headerRow.appendChild(header);
    headerRow.appendChild(email);
    headerRow.appendChild(password); 
    headerRow.appendChild(date);

    accountElement.appendChild(headerRow); 

    accounts.forEach(account => {
        const row = document.createElement("tr");

        const header = document.createElement("td");
        header.textContent = account.username;

        const email = document.createElement("td");
        email.textContent = account.email;

        const password = document.createElement("td")
        password.textContent = account.password

        const date = document.createElement("td")
        date.textContent = new Date(account.created);

        

        row.appendChild(header);
        row.appendChild(email);
        row.appendChild(password);
        row.appendChild(date);

        accountElement.appendChild(row); 
    })  
})