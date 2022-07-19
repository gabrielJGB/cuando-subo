const mainContainer = document.querySelector('.main-container')
const loadingIcon = document.querySelector('.loading-icon')

import data_ida from './gj-BB-PA.json'assert {type: 'json'};

data_ida.features.shift()
let wayPoints_ida = data_ida.features.map(obj => ({
    "coords": {
        "lng": obj.geometry.coordinates[0],
        "lat": obj.geometry.coordinates[1]
    }
}))


console.log(wayPoints_ida)


export function update(lng, lat, direction) {

    if(document.querySelector('#ida').checked){
        direction = "ida"
    }
    else{
        direction = "vuelta"
    }

    mainContainer.textContent = ''
    loadingIcon.style.display = "block"

    getCurrentBuses().then(response => {
        let busArray = getBusArray(response, direction)
        console.log(busArray)
        if (busArray.length > 0) {

            getBusMatrix(busArray, lng, lat).then(matrix => {

                loadingIcon.style.display = "none"

                let nearestBusIndex = getNearestBusIndex(matrix)
                let nearestBus = busArray[nearestBusIndex]


                let bus_lng = nearestBus.lng
                let bus_lat = nearestBus.lat

                let segmentNumberBus = getSegmentNumber(bus_lng, bus_lat, direction)
                let segmentNumberUser = getSegmentNumber(lng, lat, direction)
                console.log(nearestBus.interno,segmentNumberBus,segmentNumberUser,direction)


                if (segmentNumberBus != -1) {
                    getDirections(lng, lat, bus_lng, bus_lat, segmentNumberBus, segmentNumberUser, direction).then((data) => {
                        if(data != null){
                            displayData(data.distance, data.minutes, nearestBus)
                        }
                    })
                }
                // getDirections(lng, lat, -62.2644, -38.7092, 0, segmentNumberUser, direction)

            })

        } else {
            loadingIcon.style.display = "none"
            mainContainer.textContent = 'No hay colectivos cerca'
        }
    })
}


function displayData(distance, minutes, nearestBus) {

    mainContainer.innerHTML = `

    <div class="text1">El proximo colectvo llegará a tu ubicación en:</div>
    <div><span class="minutes">${minutes}</span> minutos</div>
    <br>
    <div class="text2">

    <div>Interno: <span class="bus-id">${nearestBus.interno}</span> </div>
    <div>Última actualización: <span class="update-time">${nearestBus.dt_tracker}</span></div>
    <div>Distancia: <span class="distance">${distance}</span> km</div> 
    
    </div>
`

}

async function getDirections(user_lng, user_lat, bus_lng, bus_lat, wayPointNumberBus, wayPointNumberUser, direction) {
    // console.log(user_lng, user_lat,   bus_lng, bus_lat, wayPointNumberBus, wayPointNumberUser, direction)
    console.log(wayPointNumberBus, wayPointNumberUser)
    if (wayPointNumberBus > wayPointNumberUser) {
        mainContainer.textContent ='No hay colectivos cerca'
        return null

    } else if (wayPointNumberBus < wayPointNumberUser) {

        // coordinates: [ubicacionBondi,wayPointBus+1...hasta waypointUser,miposicion]

        // let coordinates = {"coordinates":[[8.681495,49.41461],[8.686507,49.41943],[8.687872,49.420318]]}


        let coordinates = []

        coordinates.push([parseFloat(bus_lng), parseFloat(bus_lat)])

        for (let i = wayPointNumberBus + 1; i <= wayPointNumberUser; i++) {
            // if(direction == 'ida')
            // console.log(i)
            coordinates.push([wayPoints_ida[i].coords.lng, wayPoints_ida[i].coords.lat])
        }

        coordinates.push([parseFloat(user_lng), parseFloat(user_lat)])
        console.log(coordinates)

        const params = {
            'coordinates': coordinates,
            'maximum_speed': 80
        }

        const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-hgv', {
            method: 'POST',
            body: JSON.stringify(params),
            headers: {
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                'Content-type': 'application/json;charset=UTF-8',
                'Authorization': '5b3ce3597851110001cf62484ac28c01d47e427286f56abdab88d091'
            }
        })


        const route = await response.json()


        let distance = ((route.routes[0].summary.distance) / 1000).toFixed(1)
        let duration = route.routes[0].summary.duration
        let minutes = Math.ceil((duration + duration * 0.25) / 60)

        return {
            distance,
            minutes
        }
        // console.log('El colectivo llega en '+minutes+ ' minutos')
        // console.log('Distancia: '+distance +' km')
    } else if (wayPointNumberBus == wayPointNumberUser) {
        if (direction == 'ida') {
            console.log(wayPointNumberBus,wayPointNumberUser)
            let wp_lng = wayPoints_ida[wayPointNumberBus].coords.lng
            let wp_lat = wayPoints_ida[wayPointNumberBus].coords.lat

            const params = {
                'locations': [
                    [wp_lng, wp_lat],
                    [bus_lng, bus_lat],
                    [user_lng, user_lat]
                ],
                "metrics": ["distance", "duration"]
            }


            const response = await fetch('https://api.openrouteservice.org/v2/matrix/driving-hgv', {
                method: 'POST',
                body: JSON.stringify(params),
                headers: {
                    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                    'Content-type': 'application/json;charset=UTF-8',
                    'Authorization': '5b3ce3597851110001cf62484ac28c01d47e427286f56abdab88d091'
                }
            })

            const matrix = await response.json()

            if (matrix.durations[0][1] > matrix.durations[0][2]) {
                mainContainer.textContent ='No hay colectivos cerca'
                return null
            } else {
                console.log(matrix)
                let duration = matrix.durations[0][2] - matrix.durations[0][1]
                let minutes = Math.ceil((duration + duration * 0.25) / 60)
                let distance = ((matrix.distances[0][2] - matrix.distances[0][1])/1000).toFixed(1)
                return {distance,minutes}
            }

        }

    }


}



async function getCurrentBuses() {
    const response = await fetch('https://www.gpsbahia.com.ar/frontend/track_data/3.json')
    const parsed = await response.json()
    return parsed
}

function getBusArray(response, direction) {
    let busArray = []
    response.data.forEach(obj => {

        if (obj.direccion == direction && !obj.name.includes('CARGO') && !obj.name.includes('BOXER') && obj.interno != '116') {
            busArray.push(obj)

        }
    })

    return busArray
}

async function getBusMatrix(busArray, lng, lat) {

    let coordinates = busArray.map(obj => ([
        parseFloat(obj.lng), parseFloat(obj.lat)
    ]))

    coordinates.unshift([lng, lat])

    const coords = {
        'locations': coordinates
    }

    const response = await fetch('https://api.openrouteservice.org/v2/matrix/driving-hgv', {
        method: 'POST',
        body: JSON.stringify(coords),
        headers: {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            'Content-type': 'application/json;charset=UTF-8',
            'Authorization': '5b3ce3597851110001cf62484ac28c01d47e427286f56abdab88d091'
        }
    })

    const matrix = await response.json()
    return matrix
}

function getNearestBusIndex(matrix, busArray) {
    matrix.durations[0].shift()
    let valueIndex = matrix.durations[0].indexOf(Math.min(...matrix.durations[0])) + 1
    return (valueIndex - 1)

}

// --------------------------------------------------------------------------------------------

import polygons_ida from './geojson/polygons_ida.json'assert {type: 'json'};

let arrayPolygonsIda = polygons_ida.features.map(obj =>
    obj.geometry.coordinates[0]
)

// import segments_vuelta from './geojson/polygon_ida.json' assert { type: 'json' };
// let arrayPolygonsVuelta = polygon_vuelta.features.map(obj=>
//     obj.geometry.coordinates[0]
// )


function getSegmentNumber(lng, lat, direction) {
    const point = {
        latitude: lat,
        longitude: lng
    };

    if (direction == 'ida') {
        for (let i = 0; i < arrayPolygonsIda.length; i++) {

            if (geolib.isPointInPolygon(point, arrayPolygonsIda[i])) {
                return (i)
            }
        }
    }
    // else{
    // 	for (let i = 0; i < arrayPolygonsVuelta.length; i++) {
    //         if (geolib.isPointInPolygon(point, arrayPolygonsVuelta[i])) {
    //             return (i)
    //         }
    //     }
    // }
    return -1
}