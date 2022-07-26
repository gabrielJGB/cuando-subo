import {wayPoints_ida,wayPoints_vuelta} from './wayPoints.js'

const mainContainer = document.querySelector('.main-container')

export async function getDirections(user_lng, user_lat, bus_lng, bus_lat, wayPointNumberBus, wayPointNumberUser, direction) {

    if (wayPointNumberBus > wayPointNumberUser) {
        return null

    } else if (wayPointNumberBus < wayPointNumberUser) {

        let coordinates = []

        coordinates.push([parseFloat(bus_lng), parseFloat(bus_lat)])

        for (let i = wayPointNumberBus + 1; i <= wayPointNumberUser; i++) {
            if(direction == 'ida')
                coordinates.push([wayPoints_ida[i].coords.lng, wayPoints_ida[i].coords.lat])
            else if(direction == 'vuelta')
                coordinates.push([wayPoints_vuelta[i].coords.lng, wayPoints_vuelta[i].coords.lat])
        }

        coordinates.push([parseFloat(user_lng), parseFloat(user_lat)])

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

        let wp_lng,wp_lat
        if (direction == 'ida'){
            wp_lng = wayPoints_ida[wayPointNumberBus].coords.lng
            wp_lat = wayPoints_ida[wayPointNumberBus].coords.lat
        }else if (direction == 'vuelta'){
            wp_lng = wayPoints_vuelta[wayPointNumberBus].coords.lng
            wp_lat = wayPoints_vuelta[wayPointNumberBus].coords.lat

        }

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
                
                return null
            } else {
                
                let duration = matrix.durations[0][2] - matrix.durations[0][1]
                let minutes = Math.ceil((duration + duration * 0.25) / 60)
                let distance = ((matrix.distances[0][2] - matrix.distances[0][1])/1000).toFixed(1)
                return {distance,minutes}
            }

        

    }


}



export async function getCurrentBuses() {
    //  '&rand=' + Math.random()
    let url = 'https://www.gpsbahia.com.ar/frontend/track_data/3.json'
    const response = await fetch('https://corsproxy.io/?'+encodeURIComponent(url))
    const parsed = await response.json()
    
    return parsed
    
}

export function getBusArray(response, direction) {
    let busArray = []
    response.data.forEach(obj => {

        if (obj.direccion == direction && !obj.name.includes('CARGO') && !obj.name.includes('BOXER') && obj.interno != '116'&& obj.interno != '110') {
            busArray.push(obj)

        }
    })

    return busArray
}

export async function getBusMatrix(busArray, lng, lat) {

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

export function getNearestBusIndex(matrix, busArray) {
    matrix.durations[0].shift()
    let valueIndex = matrix.durations[0].indexOf(Math.min(...matrix.durations[0])) + 1
    return (valueIndex - 1)

}

