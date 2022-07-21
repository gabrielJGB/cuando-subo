// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('service-worker.js');
// }
import {
    update
} from './main.js'

const mainContainer = document.querySelector('.main-container')
const settingsPanel = document.querySelector('.settings-panel')
const settingsButton = document.querySelector('.settings-button')
const loadingIcon = document.querySelector('.loading-icon')
const list = document.querySelector('#list')
const ida = document.querySelector('#ida')
const vuelta = document.querySelector('#vuelta')
list.addEventListener('change', listChange)

settingsButton.addEventListener('click', toggleSettingsPanel)

function toggleSettingsPanel() {

    if (settingsPanel.style.top === "0px") {
        settingsButton.textContent = "Configuración"
        settingsPanel.style.top = "93%"
        if (marker != null) {
            let lat = marker._latlng.lat
            let lng = marker._latlng.lng

            let direction =getSelectedDirection()

            if (sessionStorage.getItem("direction") == null || isSessionStorageUpdated(lng,lat,direction)) {
                update(lng, lat)
                setSessionStorage(lng, lat)   
            }
        }
        
    } else {
        settingsButton.textContent = "Cerrar configuración"
        settingsPanel.style.top = 0;
    }
}

function setSessionStorage(lng, lat) {
    
    let direction = getSelectedDirection()
    
    sessionStorage.setItem("lat", lat);
    sessionStorage.setItem("lng", lng);
    sessionStorage.setItem("direction", direction);
}


function getSelectedDirection(){
    let direction
    if(document.querySelector('#ida').checked){
        return 'ida'
    }
    else{
        return 'vuelta'
    }
}


let map = L.map('map').setView([-38.8408, -62.1655], 10);
let marker = null



L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

map.on('click', onMapClick);

function onMapClick(e) {
    let lat = e.latlng.lat
    let lng = e.latlng.lng
    setMarker(lat, lng)
}


export function setMarker(lat, lng) {
    if (marker != null) {
        marker.remove()
    }
    map.setView([lat, lng], 17)
    marker = L.marker([lat, lng]).addTo(map);
}

const radioOptions = document.querySelector('.radio-toolbar')
radioOptions.addEventListener('change', handleSelectedOption)

function handleSelectedOption() {
    if (ida.checked) {
        
        fillList(ida.id)
    } else if (vuelta.checked) {
        
        fillList(vuelta.id)
    }

}

import file from './paradas.json' assert { type: 'json' };

function fillList(direction1) {

    list.innerHTML = ''
    let option1 = document.createElement('OPTION')
    option1.className = "show-list-button"
    option1.selected = true
    option1.disabled = true
    option1.hidden = true
    option1.textContent = 'Seleccionar parada'
    list.appendChild(option1)


    if (direction1 == "ida") {
        file.paradas_ida.forEach(parada => {
            let option = document.createElement('OPTION')
            option.textContent = parada.nombre
            option.value = JSON.stringify(parada.coords)
            list.appendChild(option)
        })
    } else if (direction1 == "vuelta") {
        file.paradas_vuelta.forEach(parada => {
            let option = document.createElement('OPTION')
            option.textContent = parada.nombre
            option.value = JSON.stringify(parada.coords)
            list.appendChild(option)
        })
    }
}

function listChange(e) {

    let lat = JSON.parse(list.options[list.selectedIndex].value).lat
    let lng = JSON.parse(list.options[list.selectedIndex].value).lng
    setMarker(lng, lat)
}


// const getLocationButton = document.querySelector('.get-location-button')
// getLocationButton.addEventListener('click', getLocation)

// function getLocation() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition((position) => {
//             let lat = position.coords.latitude
//             let lng = position.coords.longitude
//             setMarker(lat, lng)
//         });
//     } else {
//         alert('No se puede obtener la ubicacion')
//     }
// }



getSessionStorage()

function getSessionStorage() {
    if (sessionStorage.getItem("direction") != null) {
        loadingIcon.style.display = "block"
        let lng = sessionStorage.getItem("lng")
        let lat = sessionStorage.getItem("lat")
        let direction = sessionStorage.getItem("direction")
        if(direction != null){
           document.querySelector(`#${direction}`).checked = true
        }
        fillList(direction)
        update(lng, lat, direction)
        setMarker(lat, lng)
        return {
            lng,
            lat,
            direction
        }
    } else {

        // mainContainer.textContent = 'Selecciona la parada y el sentido del viaje en la configuración'
    }
}


function isSessionStorageUpdated(lng,lat,direction) {
    let prev_lng = sessionStorage.getItem("lng")
    let prev_lat = sessionStorage.getItem("lat")
    let prev_direction = sessionStorage.getItem("direction")
    return (prev_lat != lat || prev_lng != lng || prev_direction != direction)
}