const logout_button = document.querySelector('.logout')
const LOGOUT_URL = 'http://localhost:5005/logout';

logout_button.addEventListener ('click', (event) => {
    event.preventDefault();
    fetch(LOGOUT_URL, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
    })
    .then(res => res.json())
    .then(res => {
        location.href = res.next
    })

})
