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
let polyline

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

    localStorage.setItem("lng", lng);
    localStorage.setItem("lat", lat);
    localStorage.setItem("direction", direction);
}




let map = L.map('map').setView([-38.8408, -62.1655], 10);
let marker = null

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

map.on('click', onMapClick)

function onMapClick(e) {
    let lng = e.latlng.lng
    let lat = e.latlng.lat
    setMarker(lng, lat)
}


export function setMarker(lng, lat) {
    if (marker != null) {
        marker.remove()
    }
    map.setView([lat, lng], 17)
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

import file from './json/paradas.json'assert {type: 'json'};

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

    drawRoute()
}

function listChange(e) {

    let lng = JSON.parse(list.options[list.selectedIndex].value).lng
    let lat = JSON.parse(list.options[list.selectedIndex].value).lat
    setMarker(lng, lat)
}


// const getLocationButton = document.querySelector('.get-location-button')
// getLocationButton.addEventListener('click', getLocation)

// function getLocation() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition((position) => {
//             let lat = position.coords.latitude
//             let lng = position.coords.longitude
//             setMarker(lng, lat)
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
        drawRoute()
        setMarker(lng, lat)

        document.querySelector('#list').value = JSON.stringify({"lng":parseFloat(lng),"lat":parseFloat(lat)})
        

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
    }else{
        body.removeEventListener("touchmove", swipeMenu)
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

// window.history.pushState({ noBackExitsApp: false}, '')
// window.history.pushState({ noBackExitsApp: true }, '')

// window.addEventListener('load', function() {
//   window.history.pushState({ noBackExitsApp: true }, '')
// })


window.addEventListener('load', function() {
   window.history.pushState({ noBackExitsApp: true }, '')
 })

 window.addEventListener('popstate', function(event) {
   if (event.state.noBackExitsApp) {
    hidePanel()
     window.history.pushState({ noBackExitsApp: true }, '')
   }else{
    window.history.back()
   }
 })


// window.history.pushState(null, null, window.location.href);

function hidePanel() {
    // window.history.pushState(null, null, window.location.href);
    window.history.pushState({ noBackExitsApp: false}, '')
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

function showPanel() {
    window.history.pushState({ noBackExitsAp: false }, '')
    settingsPanel.style.left = "0%"
    isVisible = true
}


const reloadButton = document.querySelector('.reload-button')
reloadButton.addEventListener('click', () => {
    let lng = marker._latlng.lng
    let lat = marker._latlng.lat

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
        if(locationList.textContent == '( Vacío )'){
            locationList.textContent = ''
        }
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
        
        <h3>Ubicacion</h3>
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
    locationList.textContent = ' '

    if(locationsArray != null){
        if(locationsArray.length !=0){
            locationsArray.forEach(location=>{
                drawLocation(location.direction,location.location_name,location.location_coords)
            })
        }else{
            locationList.textContent = "( Vacío )"
        }
    }else{
        locationList.textContent = "( Vacío )"
    }
}


function loadLocation(){
    let location_coords = JSON.parse(this.parentNode.parentNode.dataset.coords)
    let lng = location_coords.lng
    let lat = location_coords.lat
    let direction = this.parentNode.parentNode.dataset.direction
    
    fillList(direction)

    document.querySelector(`#${direction}`).checked = true
    document.querySelector('#list').value = JSON.stringify({"lng":lng,"lat":lat})

    setMarker(lng,lat)
    setLocalStorage(lng,lat)
    update(lng,lat,direction)
    hidePanel()
}

function deleteLocation(){

    if(confirm('Estas seguro/a?')){
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
}




function drawRoute(){

    let latlngs_ida = [
        [-38.7004212, -62.2691625],
        [-38.7013338, -62.2711795],
        [-38.7035694, -62.2693556],
        [-38.7068346, -62.2662013],
        [-38.7085593, -62.2649353],
        [-38.7098151, -62.2667806],
        [-38.7140763, -62.2718983],
        [-38.717542, -62.2673171],
        [-38.7238284, -62.2591524],
        [-38.7273355, -62.2546141],
        [-38.7295786, -62.2545176],
        [-38.7297627, -62.2545069],
        [-38.7297962, -62.2533052],
        [-38.7303737, -62.2532409],
        [-38.7319723, -62.251138],
        [-38.7328594, -62.2502475],
        [-38.7335541, -62.2492497],
        [-38.7340897, -62.2488528],
        [-38.734483, -62.2479301],
        [-38.7357886, -62.2464173],
        [-38.7339558, -62.2441643],
        [-38.7364414, -62.2409778],
        [-38.73183, -62.2352486],
        [-38.7326502, -62.2341972],
        [-38.728457, -62.2289508],
        [-38.7347843, -62.2206467],
        [-38.7354622, -62.2202068],
        [-38.7360313, -62.2202604],
        [-38.7368514, -62.2197347],
        [-38.7379645, -62.2182327],
        [-38.7390315, -62.216913],
        [-38.7401528, -62.215926],
        [-38.7429144, -62.2120207],
        [-38.7477928, -62.2054332],
        [-38.7487969, -62.2040599],
        [-38.7496671, -62.2017854],
        [-38.7551893, -62.1743625],
        [-38.7577662, -62.1753066],
        [-38.7585693, -62.175092],
        [-38.7592386, -62.1739333],
        [-38.7604099, -62.1717875],
        [-38.7628193, -62.1668523],
        [-38.7694112, -62.1486132],
        [-38.7716529, -62.1425193],
        [-38.7723556, -62.1401589],
        [-38.7739616, -62.1244519],
        [-38.7747311, -62.1186154],
        [-38.7762367, -62.1168988],
        [-38.7827604, -62.1149247],
        [-38.8134308, -62.1063845],
        [-38.8191989, -62.1053546],
        [-38.8208707, -62.1045821],
        [-38.8230774, -62.103123],
        [-38.8274238, -62.0993464],
        [-38.8295634, -62.0977157],
        [-38.8403276, -62.0946257],
        [-38.8473636, -62.0929091],
        [-38.8463943, -62.086901],
        [-38.8594284, -62.0833819],
        [-38.8766447, -62.0787149],
        [-38.8776303, -62.0846372],
        [-38.8838844, -62.0829331],
        [-38.8826317, -62.0751869],
        [-38.877537, -62.0766245],
        [-38.8767185, -62.0713459]
    ]
    let latlngs_vuelta = [
        [-38.8779, -62.0708729],
        [-38.8797458, -62.0824279],
        [-38.8713014, -62.0846172],
        [-38.8702656, -62.0785661],
        [-38.8692298, -62.0788665],
        [-38.8694637, -62.0807334],
        [-38.8463065, -62.0869605],
        [-38.8473009, -62.0928507],
        [-38.8463483, -62.0930974],
        [-38.8320244, -62.0970868],
        [-38.8299895, -62.0977604],
        [-38.8283346, -62.0987475],
        [-38.824423, -62.1020519],
        [-38.8208707, -62.1045821],
        [-38.8176101, -62.1056437],
        [-38.8125274, -62.1067595],
        [-38.8050365, -62.1089053],
        [-38.7794813, -62.1158576],
        [-38.7745967, -62.1170592],
        [-38.7738194, -62.1177321],
        [-38.7732339, -62.1188908],
        [-38.772983, -62.1204572],
        [-38.7735852, -62.123354],
        [-38.7736856, -62.1265941],
        [-38.7726651, -62.1372585],
        [-38.7722971, -62.1398764],
        [-38.7714941, -62.1427302],
        [-38.7659731, -62.1580296],
        [-38.7627273, -62.1670418],
        [-38.7585777, -62.1752815],
        [-38.7580088, -62.175303],
        [-38.7571387, -62.1751742],
        [-38.7551893, -62.1743625],
        [-38.7508637, -62.1959238],
        [-38.7494952, -62.2030815],
        [-38.7477928, -62.2054332],
        [-38.7405919, -62.2152266],
        [-38.7397215, -62.2163424],
        [-38.7390315, -62.216913],
        [-38.7368514, -62.2197347],
        [-38.7360313, -62.2202604],
        [-38.7354622, -62.2202068],
        [-38.7347843, -62.2206467],
        [-38.7333278, -62.222608],
        [-38.7322732, -62.2238311],
        [-38.730365, -62.2264704],
        [-38.728457, -62.2289508],
        [-38.7397718, -62.2430572],
        [-38.735328, -62.2488293],
        [-38.7347254, -62.2488829],
        [-38.7339052, -62.2499451],
        [-38.7262638, -62.25988],
        [-38.7165706, -62.2727974],
        [-38.7117487, -62.2669073],
        [-38.7096976, -62.263989],
        [-38.7084334, -62.2620471],
        [-38.7054277, -62.264504],
        [-38.7043895, -62.2653408],
        [-38.7010823, -62.2680445],
        [-38.7004041, -62.2685595]
    ]

    if(polyline != undefined){
        polyline.remove()
    }

    if(getSelectedDirection()== 'ida'){
        polyline = L.polyline(latlngs_ida, {
            color: 'red',
            opacity:0.9
        }).addTo(map);
    }else{
        polyline = L.polyline(latlngs_vuelta, {
            color: 'red'
        }).addTo(map);
    }

}

// window.addEventListener('load', function() {
//   window.history.pushState({ noBackExitsApp: true }, '')
//   console.log('pushed')
// })

