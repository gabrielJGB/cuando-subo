
const mapContainer = document.querySelector('.map-container')
const toggleMapButton = document.querySelector('.open-map-button')
toggleMapButton.addEventListener('click', toggleMap)

let userLocation
let map = L.map('map').setView([-38.79690830348428, -62.1814184570312], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

let popup = L.popup();
let marker = null

function onMapClick(e) {
    if (marker != null) {
        marker.remove()
    }
    let lat = e.latlng.lat
    let lng = e.latlng.lng
    userLocation = [lat,lng]
    marker = L.marker([lat, lng]).addTo(map);
    console.log(lat, lng)
}
map.on('click', onMapClick);


const showListButton = document.querySelector('.show-list-button')
showListButton.addEventListener('change', showList)
const getLocationButton = document.querySelector('.get-location-button')
getLocationButton.addEventListener('click', getLocation)

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
        	if(marker!=null){
        		marker.remove()
        	}
            marker = L.marker([position.coords.latitude, position.coords.longitude]).addTo(map);
            map.setView([position.coords.latitude, position.coords.longitude], 17);
            userLocation = [position.coords.latitude,position.coords.longitude]
        });
    } else {
        console.log('No se puede obtener la ubicacion')
    }
}

function toggleMap() {

    if (mapContainer.style.top === "0px") {
        toggleMapButton.textContent = "Seleccionar ubicación";
        mapContainer.style.top = "93%";

    } else {

        toggleMapButton.textContent = "Cerrar mapa";
        mapContainer.style.top = 0;

    }
}


