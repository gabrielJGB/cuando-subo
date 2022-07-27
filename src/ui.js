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
const next = document.querySelector('.next')
const previous = document.querySelector('.previous')
const c1 = document.querySelector('.c1')


let direction = getSelectedDirection()
let initialX, isVisible, c
list.addEventListener('change', listChange)
loadingIcon.style.display = 'none'
settingsButton.addEventListener('click', toggleSettingsPanel)
settingsPanel.style.left = "-100%"

export function writeMainContainer(text) {
    mainContainer.innerHTML = text
}

export function writeSchedules(direction, schedules) {
    document.querySelector('.timetables').style.display = 'flex'
    if (direction == "ida") {
        c1.textContent = "Parque de Mayo"
    } else {
        c1.textContent = "Terminal Punta Alta"
    }

    next.textContent = schedules.next
    previous.textContent = schedules.previous
}

export function getSelectedDirection() {
    if (document.querySelector('#ida').checked) {
        return "ida"
    } else if (document.querySelector('#vuelta').checked) {
        return "vuelta"
    } else {
        return null
    }
}


function toggleSettingsPanel() {

    if (isVisible) {
        hidePanel()
    } else {
        showPanel()
    }
}

function setLocalStorage(lng, lat) {

    let direction = getSelectedDirection()

    localStorage.setItem("lat", lat);
    localStorage.setItem("lng", lng);
    localStorage.setItem("direction", direction);
}




let map = L.map('map').setView([-38.8408, -62.1655], 10);
let marker = null

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

map.on('click', onMapClick)

function onMapClick(e) {
    let lat = e.latlng.lat
    let lng = e.latlng.lng
    setMarker(lat, lng)
}


export function setMarker(lat, lng) {
    if (marker != null) {
        marker.remove()
    }
    map.setView([lat, lng], 18)
    marker = L.marker([lat, lng]).addTo(map)
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

import file from './geojson/paradas.json'assert {type: 'json'};

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
    if (localStorage.getItem("direction") != null) {
        loadingIcon.style.display = "block"
        let lng = localStorage.getItem("lng")
        let lat = localStorage.getItem("lat")
        let direction = localStorage.getItem("direction")
        if (direction != null) {
            document.querySelector(`#${direction}`).checked = true
        }
        fillList(direction)
        update(lng, lat, direction)
        setMarker(lat, lng)

    } else {

        // mainContainer.textContent = 'Selecciona la parada y el sentido del viaje en la configuración'
    }
}


function isSessionStorageUpdated(lng, lat, direction) {
    let prev_lng = localStorage.getItem("lng")
    let prev_lat = localStorage.getItem("lat")
    let prev_direction = localStorage.getItem("direction")
    return (prev_lat != lat || prev_lng != lng || prev_direction != direction)
}


let body = document.querySelector('body')
body.addEventListener("touchstart", swipeStart)


function swipeStart(e) {

    if (!e.target.classList.contains('leaflet-container') && !e.target.classList.contains('leaflet-touch') && !e.target.classList.contains('leaflet-retina') && !e.target.classList.contains('leaflet-safari') && !e.target.classList.contains('leaflet-fade-anim') && !e.target.classList.contains('leaflet-grab') && !e.target.classList.contains('leaflet-touch-drag') && !e.target.classList.contains('leaflet-touch-zoom') && !e.target.classList.contains('leaflet-marker-icon')) {

        initialX = e.touches[0].clientX
        body.addEventListener("touchmove", swipeMenu)
    }

}

function swipeMenu(e) {
    let currentX = e.touches[0].clientX;
    if (currentX > initialX + window.innerWidth / 4) {
        showPanel()
        body.removeEventListener("touchmove", swipeMenu)
    } else if (currentX < initialX - window.innerWidth / 4) {
        hidePanel()
            // body.removeEventListener("touchmove", swipeMenu)
    }
}


function hidePanel() {
    settingsPanel.style.left = "-100%";
    isVisible = false;

    if (marker != null) {
        let lat = marker._latlng.lat
        let lng = marker._latlng.lng

        let direction = getSelectedDirection()

        if (localStorage.getItem("direction") == null || isSessionStorageUpdated(lng, lat, direction)) {

            update(lng, lat, direction)
            setLocalStorage(lng, lat)
        }
    }
}

function showPanel(vaue) {
    settingsPanel.style.left = "0%"
    isVisible = true
}


const reloadButton = document.querySelector('.reload-button')
reloadButton.addEventListener('click', () => {
    let lat = marker._latlng.lat
    let lng = marker._latlng.lng

    setLocalStorage(lng, lat)
    document.location.reload()
})


const mapBox = document.querySelector('#map')
const toggleMapButton = document.querySelector('.toggle-map-button')
toggleMapButton.addEventListener('click', toggleMap)
mapBox.style.height = "0"

function toggleMap() {

    if (mapBox.style.height == "40vh") {
        toggleMapButton.textContent = "Mostrar mapa"
        mapBox.style.height = "0"

    } else {
        toggleMapButton.textContent = "Ocultar mapa"
        mapBox.style.height = "40vh"

    }

}

const locationList = document.querySelector('.location-list')
const saveButton = document.querySelector('.save-button')
saveButton.addEventListener('click', saveLocation)

function saveLocation() {
    let location_name = list.options[list.selectedIndex].text
    let location_coords = list.options[list.selectedIndex].value
    let direction = getSelectedDirection()
    

    if (location_coords != 'Seleccionar parada' && location_name && 'Seleccionar parada' && direction != null) {
        

        drawLocation(direction,location_name,location_coords)
        saveLocationToLocalStorage(location_coords, location_name, direction)

    } else {
        alert('Seleccionar ubicacion y sentido')
    }
}

function drawLocation(direction,location_name,location_coords){
    let div = document.createElement('DIV')
    let dir = ''
    if (direction == 'ida') {
            dir = 'Bahía Blanca &#8594; Punta Alta'
        } else {
            dir = 'Punta Alta &#8594; Bahía Blanca'
    }

    div.className = "location"
    div.dataset.coords = location_coords
    div.dataset.direction = direction
    div.innerHTML = `
        
        <h3>Ubicacion 1</h3>
        <span><span class="t">Sentido</span>: <span class="dir">${dir}</span></span>
        <span><span class="t">Ubicación</span>: <span class="dir">${location_name}</span></span>
        <div class="location-buttons">
            <button class="delete-button">Borrar</button>
            <button class="load-button">Cargar</button>
        </div> 
    `
    div.querySelector('.load-button').addEventListener('click',loadLocation)
    div.querySelector('.delete-button').addEventListener('click',deleteLocation)

    locationList.appendChild(div)
        
}



function saveLocationToLocalStorage(location_coords, location_name, direction) {

    let location = {
        "location_name": location_name,
        "location_coords":location_coords,
        "direction":direction
    }


    let locationsArray;

    if (localStorage.getItem('locations') === null) {
        locationsArray = []
    } else {
     
         locationsArray = JSON.parse(localStorage.getItem('locations'))
     }
     
     locationsArray.push(location);     
     localStorage.setItem('locations', JSON.stringify(locationsArray))
}

getLocationsFromLocalStorage()

function getLocationsFromLocalStorage(){
    let locationsArray = JSON.parse(localStorage.getItem('locations'))
    if(locationsArray != null){
        locationList.textContent = ''
        locationsArray.forEach(location=>{
            drawLocation(location.direction,location.location_name,location.location_coords)
        })
    }else{
        locationList.textContent = "( Vacío )"
    }
}


function loadLocation(){
    let location_coords = JSON.parse(this.parentNode.parentNode.dataset.coords)
    let lng = location_coords.lng
    let lat = location_coords.lat
    let direction = this.parentNode.parentNode.dataset.direction

    update(lat,lng,direction)
    hidePanel()
}

function deleteLocation(){
    let location_coords = this.parentNode.parentNode.dataset.coords
    let direction = this.parentNode.parentNode.dataset.direction 

    let locationsArray = JSON.parse(localStorage.getItem('locations'))
    
    locationsArray.forEach(location=>{
        if(location.direction == direction && location.location_coords == location_coords)
            locationsArray.splice(locationsArray.indexOf(location),1)
    })

    localStorage.setItem('locations', JSON.stringify(locationsArray))
    locationList.textContent = ''
    getLocationsFromLocalStorage()
}



















