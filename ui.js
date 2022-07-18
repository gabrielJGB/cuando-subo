// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('service-worker.js');
// }


const settingsPanel = document.querySelector('.settings-panel')
const settingsButton = document.querySelector('.settings-button')
const showListButton = document.querySelector('.show-list-button')
showListButton.style['text-align'] = 'center'

settingsButton.addEventListener('click', toggleSettingsPanel)

function toggleSettingsPanel() {

    if (settingsPanel.style.top === "0px") {
        settingsButton.textContent = "Configuración";
        settingsPanel.style.top = "93%";

    } else {

        settingsButton.textContent = "Cerrar configuración";
        settingsPanel.style.top = 0;

    }
}

let map = L.map('map').setView([-38.8408, -62.1655], 10);
let marker
let direccion

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

map.on('click', onMapClick);

function onMapClick(e) {
    let lat = e.latlng.lat
    let lng = e.latlng.lng
    setMarker(lat, lng)
}


function setMarker(lat, lng) {
    if (marker != null) {
        marker.remove()
    }
    map.setView([lat,lng],17)
    marker = L.marker([lat, lng]).addTo(map);
    console.log(marker,direccion)
}

const radioOptions = document.querySelector('.radio-toolbar')
radioOptions.addEventListener('change', handleSelectedOption)

function handleSelectedOption() {
    let ida = document.getElementById('ida')
    let vuelta = document.getElementById('vuelta')

    if (ida.checked) {
        direccion = ida.id
        fillList(ida.id)
    } else if (vuelta.checked) {
        direccion = vuelta.id
        fillList(vuelta.id)
    }

}

import file from './paradas.json'assert {type: 'json'};

const list = document.querySelector('#list')

function fillList(direction) {
    
    list.innerHtml = ''
    let option1 = document.createElement('OPTION')
    option1.className = "show-list-button"
    option1.selected = true
    option1.disabled = true
    option1.hidden = true
    option1.textContent = 'Seleccionar parada'
    list.appendChild(option1)

    if (direction == 'ida') {
        file.paradas_ida.forEach(parada => {
            let option = document.createElement('OPTION')
            option.textContent = parada.nombre
            option.value = parada.coords
            list.appendChild(option)
        })
    } else {
        file.paradas_vuelta.forEach(parada => {
            let option = document.createElement('OPTION')
            option.textContent = parada.nombre
            option.value = JSON.stringify(parada.coords)
            list.appendChild(option)
        })
    }
}

fillList("vuelta")
direccion = "vuelta"

list.addEventListener('change',listChange)

function listChange(e) {
    let lat = JSON.parse(list.options[list.selectedIndex].value).lat
    let lng = JSON.parse(list.options[list.selectedIndex].value).lng
    setMarker(lng,lat)
}


const getLocationButton = document.querySelector('.get-location-button')
getLocationButton.addEventListener('click', getLocation)

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            let lat = position.coords.latitude
            let lng = position.coords.longitude
            setMarker(lat,lng)
        });
    } else {
        alert('No se puede obtener la ubicacion')
    }
}