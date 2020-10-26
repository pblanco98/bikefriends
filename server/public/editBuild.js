const build_form = document.querySelector('form.bikebuild');
const API_URL = 'http://localhost:5005/editBuild';

build_form.addEventListener ('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(build_form);
    const buildData = {}
    for (let key of formData.keys()) {
        buildData[key] = formData.get(key)
     }
    const build_id = buildData.id
    delete buildData.id
    const BUILD_URL = `${API_URL}/${build_id}`
    fetch(BUILD_URL, {
        method: 'POST',
        body: JSON.stringify({
            buildData
        }),
        headers: {
            'content-type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(res => {
        console.log(res)
        location.href = res.next;
    })
})