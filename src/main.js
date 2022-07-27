// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('service-worker.js');
// }

import  {getSegmentNumber} from './polygons.js'
import {getDirections,getCurrentBuses,getBusArray,getBusMatrix,getNearestBusIndex} from './requests.js'
import timetables from './geojson/horarios.json' assert {type: 'json'};
import {writeMainContainer,writeSchedules} from './ui.js'
import {getSchedule} from './test.js'
// const mainContainer = document.querySelector('.main-container')

// loadingIcon.style.display = "none"


export function update(lng, lat, direction) {

    
    
    // mainContainer.textContent = ""
    // loadingIcon.style.display = "none"//borrar    
    const loadingIcon = document.querySelector('.loading-icon')
    document.querySelector('.timetables').style.display = 'none'
    writeMainContainer(' ')
    

    // loadingIcon.style.display = "none"  

    // loadingIcon.style.display = "none"
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
                            loadingIcon.style.display = "none"
                            writeMainContainer("No hay colectivos en camino. Intentá de nuevo en unos minutos")
                            writeSchedules(direction,getSchedule(direction))

                        }
                    })
                }
                else{
                    writeMainContainer("No hay colectivos en camino. Intentá de nuevo en unos minutos")
                    writeSchedules(direction,getSchedule(direction))
                }
                

            })

        } 
        else {
            loadingIcon.style.display = "none"
            writeMainContainer("No hay colectivos en camino. Intentá de nuevo en unos minutos")
            writeSchedules(direction,getSchedule(direction))
        }
    })
}


function displayData(distance, minutes, nearestBus) {
    let s = ''
    if(minutes!=1){
        s = 's'
    }

    let m = ' '
    if(distance <= 0.2){
        m = '~'
    }
    

    let time = new Date(nearestBus.dt_tracker)
    let time1 = new Date(time.setHours(time.getHours()-3))
    let time_hs = String(time1.getHours()).padStart(2,0)
    let time_min = String(time1.getMinutes()).padStart(2,0)
    let time_sec = String(time1.getSeconds()).padStart(2,0)

    let text = `

    <div class="text1">El colectvo llegará a la ubicación seleccionada en:</div>
    <div><span class="minutes">${m}${minutes}</span> minuto${s}</div>
    <br>
    <div class="text2">

    <div>Interno: <span class="bus-id">${nearestBus.interno}</span> </div>
    <div>Distancia: <span class="distance">${distance}</span> km</div> 
    <div>Actualizado a las: <span class="update-time">${time_hs}:${time_min}:${time_sec}</span></div>
    
    </div>
    `

    writeMainContainer(text)
}





