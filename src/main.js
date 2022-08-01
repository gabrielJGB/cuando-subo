if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}

import  {getSegmentNumber} from './polygons.js'
import {getDirections,getCurrentBuses,getBusArray,getBusMatrix,getNearestBusIndex} from './requests.js'
import timetables from './geojson/horarios_invierno.json' assert {type: 'json'};
import {writeMainContainer,writeSchedules,getSelectedDirection} from './ui.js'
import {getSchedule} from './test.js'

export function update(lng, lat, direction) {

    const loadingIcon = document.querySelector('.loading-icon')
    document.querySelector('.timetables').style.display = 'none'
    writeMainContainer(' ')
    
    // loadingIcon.style.display = "none" //borrar
    loadingIcon.style.display = "block"
    getCurrentBuses().then(response => {
        let busArray = getBusArray(response, direction)
                
        if (busArray.length > 0) {

            getBusMatrix(busArray, lng.toString(), lat.toString()).then(matrix => {
                loadingIcon.style.display = "none"
                let nearestBusIndex = getNearestBusIndex(matrix)
                let nearestBus = busArray[nearestBusIndex]

                let bus_lng = nearestBus.lng
                let bus_lat = nearestBus.lat

                let segmentNumberBus = getSegmentNumber(bus_lng, bus_lat, direction)
                let segmentNumberUser = getSegmentNumber(lng, lat, direction)
                // console.log(nearestBus.interno,segmentNumberBus,segmentNumberUser,direction)


                if (segmentNumberBus != -1) {
                    getDirections(lng, lat, bus_lng, bus_lat, segmentNumberBus, segmentNumberUser, direction).then((data) => {
                        
                        if(data != null){
                                
                            displayData(data.distance, data.minutes, nearestBus)
                        }else{
                            noData(direction)
                        }
                    })
                }
                else{
                    noData(direction)
                }           
            })
        } 
        else {

            noData(direction)
        }
    })
}

function noData(direction){
    console.log('4')
    const loadingIcon = document.querySelector('.loading-icon')
    loadingIcon.style.display = "none"
    writeMainContainer("No hay colectivos en camino.<br>Intentá de nuevo en unos minutos.")
    writeSchedules(direction,getSchedule(direction))
}




function displayData(distance, minutes, nearestBus) {
    
    let one_minute = minutes == 1
    let close_distance = distance <= 0.2
        

    let direction 
    if(getSelectedDirection()=="vuelta"){
        direction = 'Punta Alta &#8594; Bahía Blanca'
    }else{
        direction = 'Bahía Blanca &#8594; Punta Alta'
    }

    let list =  document.querySelector('#list')
    let location_name = list.options[list.selectedIndex].text

    let time = new Date(nearestBus.dt_tracker)
    let time1 = new Date(time.setHours(time.getHours()-3))
    let eta_time = time1

    let time_hs = String(time1.getHours()).padStart(2,0)
    let time_min = String(time1.getMinutes()).padStart(2,0)
    let time_sec = String(time1.getSeconds()).padStart(2,0)

    let busTime = time
    busTime = busTime.setMinutes(busTime.getMinutes()+3) 

    let currentTime = new Date()
    let delay = currentTime > busTime


    let eta_s = eta_time.setMinutes(eta_time.getMinutes()+minutes)
    let etaHours = String(new Date(eta_s).getHours()).padStart(2,0)
    let etaMinutes = String(new Date(eta_s).getMinutes()).padStart(2,0)
    let eta = etaHours + ':' + etaMinutes
    

    let text = `

    <div class="text1">El colectvo llegará a la ubicación seleccionada en:</div>
    <div>
        <span class="minutes">${close_distance?"~":""}${minutes}</span> ${one_minute?" minuto":" minutos"}
        <div class="eta">Estimado: <span>${eta}</span></div>
    </div>
    <br>
    <div class="text2">
        <div>Interno: <span class="bus-id">${nearestBus.interno}</span> </div>
        <div>Distancia: <span class="distance">${distance}</span> km</div> 
        <div>Actualizado a las: <span class="update-time ${delay?"update-delay":""}"}>${time_hs}:${time_min}:${time_sec}</span></div>
    </div>
    <div class="info">
        <div class="direction">${direction}</div>
        <div class="loc-name">${location_name}</div>
    </div>
    `


    writeMainContainer(text)
}



