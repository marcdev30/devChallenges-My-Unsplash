function initApp() {
    const socket = io();
    addPopup = document.getElementById("addPhoto");
    deletePopup = document.getElementById("deletePhoto");

    Array.from(document.getElementsByClassName("btn-outline-danger")).forEach(button => {
        button.addEventListener('click', openDeletePhotoPopup);
    });

    params = new URLSearchParams(window.location.search);

    if(params.get('filter') != null) {
        socket.emit('filter', params.get('filter'));
    } else {
        socket.emit('filter', '')
    }

    socket.on('displayPosts', (posts) => {
        posts.reverse().forEach(post => {
            smallestColumn().innerHTML += `
                <div class="image">
                    <img src="/images/${post.imageUrl}" alt="">
                    <div class="image-background"></div>
                    <h4>${post.title}</h4>
                    <button class="btn btn-outline-danger" onclick="openDeletePhotoPopup(this)" value="${post._id}">delete</button>
                </div>
            `;
        });
    });
}


function smallestColumn() {

    const columns = [];
    const heights = [];

    Array.from(document.getElementsByClassName("column")).forEach(column => {
        columns.push(column);
        heights.push(column.offsetHeight);
    });

    return columns[heights.indexOf(Math.min(...heights))];
}

function openAddPhotoPopup() {
    addPopup.style.display = "block";
}

function closeAddPhotoPopup() {
    addPopup.style.display = "none";
}

function openDeletePhotoPopup(element) {
    const value = element.value;
    deletePopup.style.display = "block";
    deletePopup.querySelector('.btn').value = value;
}

function closeDeletePhotoPopup() {
    deletePopup.style.display = "none";
}

const searchInput = document.querySelector('#search-input');
searchInput.onkeypress = function(e) {
    if (!e) e = window.event;
    const keyCode = e.code || e.key;
    if (keyCode == 'Enter') {
        location.href = location.protocol + '//' + location.host + "/?filter=" + searchInput.value;
    }
}

document.addEventListener("DOMContentLoaded", initApp);