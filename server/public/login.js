const login_form = document.querySelector('form.login-form');
const LOGIN_URL = 'http://localhost:5005/login';

if (login_form !== null) {
    login_form.addEventListener ('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(login_form);
        const login_username = formData.get('username');
        const login_password = formData.get('password');

        const account = {
            login_username,
            login_password,
        }
        console.log(account)

        fetch(LOGIN_URL, {
            method: 'POST',
            body: JSON.stringify({
                account
            }),
            headers: {
                'content-type': 'application/json'
            },

        })
        .then(res => res.json())
        .then(response => {
            // check that it is a redirect
            console.log(response)
            location.href = response.next;
        })
    })
}