const PROFILE_URL = 'http://localhost:5005/profile';
const CURRENT_URL = location.href;

const CURRENT_URL_PARTS = CURRENT_URL.split('/');
const user_id = CURRENT_URL_PARTS[4];

fetch(PROFILE_URL, {
    method: 'POST',
    body: JSON.stringify({
        user_id
    }),
    headers: {
        'content-type': 'application/json'
    }
})
.then(res => res.json())
.then(res => {
    const profileElement = document.querySelector('.profile');
    profileElement.innerHTML = '';
    const headerRow = document.createElement("tr");
    const rowOrder = [
        'id',
        'frame',
        'fork_headset',
        'crankset',
        'pedals',
        'drivetrain',
        'handlebars',
        'saddle',
        'front_wheel',
        'rear_wheel',
        'more_info',
    ]
    rowOrder.forEach(headerName => {
        const headerLabel = headerName.charAt(0).toUpperCase() + headerName.slice(1);
        const cleanHeaderLabel = headerLabel.replace(/[_-]/g, " "); 
        const headerElement = document.createElement("td");
        headerElement.textContent = cleanHeaderLabel;
        headerRow.appendChild(headerElement)
    })

    const headerElement = document.createElement("td");
    headerElement.textContent = 'Action';
    headerRow.appendChild(headerElement)

    profileElement.appendChild(headerRow)

    res.builds.forEach(build => {
        const row = document.createElement("tr");
        rowOrder.forEach(prop => {
            if (Object.prototype.hasOwnProperty.call(build, prop)) {
                const newBuild = document.createElement("td");
                newBuild.textContent = build[prop];
                row.appendChild(newBuild);    
            }
        })
        const newBuild = document.createElement("td");
        const editLink = document.createElement("a")
        editLink.innerText = 'Edit'
        editLink.href = `/editBuild/${build.id}`
        newBuild.appendChild(editLink);

        row.appendChild(newBuild);

        profileElement.appendChild(row); 
    });
})
