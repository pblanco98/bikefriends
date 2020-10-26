const build_form = document.querySelector('form.bikebuild');
const API_URL = 'http://localhost:5005/build';

build_form.addEventListener ('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(build_form);
    const buildData = {}
    for (let key of formData.keys()) {
        buildData[key] = formData.get(key)
     }

    fetch(API_URL, {
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

new autoComplete({
    data: {
      src: async () => {
        // User search query
        const query = document.querySelector("#frame").value;
        // Fetch External Data Source
        const source = await fetch(`http://localhost:5005/autocompleteParts`);
        // Format data into JSON
        const data = await source.json();
        // Return Fetched data
        return data.parts;
      },
      key: ["title"],
      cache: false
    },
    selector: "#frame"
})