// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('service-worker.js');
// }


let userLocation = [-62.26707458496094,-38.71772875640288]
let direccion = "vuelta" 
let value = 0
let busArray = []
let busSelected 
let busesObj


// getCurrentBuses()

function getCurrentBuses() {
    fetch('https://www.gpsbahia.com.ar/frontend/track_data/3.json')
        .then(datos => {
            datos.json().then(resp => {
                console.log(resp)
                busesObj = resp

                busArray = []
                resp.data.forEach(obj => {
                    if (obj.direccion == direccion && !obj.name.includes('CARGO') && !obj.name.includes('BOXER')) {
                        busArray.push(obj)
                    }
                })
                if (busArray.length != 0) {
                    getBusMatrix(busArray)
                } else {
                    console.log('No hay colectivos cerca')
                }
            })
        })

}


function getBusMatrix(data) {

    let coordinates = data.map(obj => ([
        parseFloat(obj.lng), parseFloat(obj.lat)
    ]))

    coordinates.unshift(userLocation)

    const coords = {
        'locations': coordinates
    }
    console.log(coords)
    fetch('https://api.openrouteservice.org/v2/matrix/driving-car', {
            method: 'POST',
            body: JSON.stringify(coords),
            headers: {
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                'Content-type': 'application/json;charset=UTF-8',
                'Authorization': '5b3ce3597851110001cf62484ac28c01d47e427286f56abdab88d091'
            }
        })
        .then(datos => {
            datos.json().then(resp => {
                console.log(resp)
                getNearestBus(resp)
            })
        })


}



function getNearestBus(matrix) {
    matrix.durations[0].shift()
    let valueIndex = matrix.durations[0].indexOf(Math.min(...matrix.durations[0])) + 1
    let location = matrix.destinations[valueIndex].location
    value = matrix.destinations[valueIndex].location[0].toFixed(2)

    
    busSelected = busArray[valueIndex-1]
    
    
    // console.log(getSegmentNumber(location))
    getETA(location)
}


function getETA(location) {

    let busLon = location[0]
    let busLat = location[1]
    let endLon = userLocation[0]
    let endLat = userLocation[1]



    fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf62484ac28c01d47e427286f56abdab88d091&start=${busLon},${busLat}&end=${endLon},${endLat}`)
        .then(datos => {
            datos.json().then(resp => {
                let arrivalTime = Math.round((resp.features[0].properties.summary.duration) / 60) 
                let distance = ((resp.features[0].properties.summary.distance) / 1000).toFixed(1)

                const minutesDiv = document.querySelector('.minutes')
                const busId = document.querySelector('.bus-id')
                const updateTime = document.querySelector('.update-time')
                const distanceDiv = document.querySelector('.distance')


                minutesDiv.textContent = arrivalTime
                distanceDiv.textContent = distance
                updateTime.textContent = busSelected.dt_tracker
                busId.textContent = busSelected.interno

            })
        })

    
}


import {segments_BP,segments_PB} from './segments.js'

function getSegmentNumber(lat,lng){
    const point = { latitude: lat, longitude: lng};

    for(let i=0;i<segments_BP.length;i++){
        if(geolib.isPointInPolygon(point,segments_BP[i])){
            return (i+1)
        }
    }
}
