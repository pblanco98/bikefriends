const register_form = document.querySelector('form.register-form');
const API_URL = 'http://localhost:5005/register';

register_form.addEventListener ('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(register_form);
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');

    const account = {
        username,
        email,
        password,
    }

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
            account
        }),
        headers: {
        'content-type': 'application/json'
        }
    }).then(res => res.json())
    .then(res => {
        if(res.errors.length > 0){
            const accountElement = document.querySelector('.alerts')
            accountElement.innerHTML = res.errors.join(', ')
        }
    }) 
})
