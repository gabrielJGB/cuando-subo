// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('service-worker.js');
// }

import  {getSegmentNumber} from './polygons.js'
import {getDirections,getCurrentBuses,getBusArray,getBusMatrix,getNearestBusIndex} from './requests.js'
import timetables from './geojson/horarios.json' assert {type: 'json'};
import {writeMainContainer} from './ui.js'

// const mainContainer = document.querySelector('.main-container')

// loadingIcon.style.display = "none"


export function update(lng, lat, direction) {

    if(document.querySelector('#ida').checked){
        direction = "ida"
    }
    else{
        direction = "vuelta"
    }

    // mainContainer.textContent = ""
    // loadingIcon.style.display = "none"//borrar    
    const loadingIcon = document.querySelector('.loading-icon')
    loadingIcon.style.display = "block"

    getCurrentBuses().then(response => {
        let busArray = getBusArray(response, direction)
                
        if (busArray.length > 0) {

            getBusMatrix(busArray, lng, lat).then(matrix => {

                loadingIcon.style.display = "none"
                let nearestBusIndex = getNearestBusIndex(matrix)
                let nearestBus = busArray[nearestBusIndex]


                let bus_lng = nearestBus.lng
                let bus_lat = nearestBus.lat

                let segmentNumberBus = getSegmentNumber(bus_lng, bus_lat, direction)
                let segmentNumberUser = getSegmentNumber(lng, lat, direction)
                console.log(nearestBus,segmentNumberBus,segmentNumberUser,direction)


                if (segmentNumberBus != -1) {
                    getDirections(lng, lat, bus_lng, bus_lat, segmentNumberBus, segmentNumberUser, direction).then((data) => {
                        console.log(data)
                        if(data != null){

                            displayData(data.distance, data.minutes, nearestBus)
                        }else{
                            loadingIcon.style.display = "none"
                            writeMainContainer('No hay colectivos en camino')
                        }
                    })
                }
                // else{
                //     mainContainer.textContent = "No hay colectivos en camino."
                // }
                

            })

        } 
        // else {
        //     loadingIcon.style.display = "none"
        //     mainContainer.textContent = "No hay colectivos en camino"
        // }
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
    console.log(distance,minutes,nearestBus)

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


function getSchedule(direction){
    let nextDeparture = []
    let previousDeparture = []
    let currentTime = new Date().setMinutes(new Date().getMinutes()+1)

    if(direction =="ida"){
        timetables.horarios_ida.forEach(table=>{    
            let nextBus = new Date()
            nextBus.setHours(table.horas)
            nextBus.setMinutes(table.minutos)
            nextBus.setSeconds('00')
            
            if(nextBus.getHours()<5){
                 nextBus.setDate(nextBus.getDate()+1)
            }
            if(nextBus>currentTime){
                 let previousIndex = timetables.horarios_ida.indexOf(table) -1
                let previous_d = timetables.horarios_ida[previousIndex].horas + ':' + timetables.horarios_ida[previousIndex].minutos
                previousDeparture.push(previous_d)
                nextDeparture.push(nextBus)
            }
        })
    }else{
        timetables.horarios_vuelta.forEach(table=>{    
            let nextBus = new Date()
            nextBus.setHours(table.horas)
            nextBus.setMinutes(table.minutos)
            nextBus.setSeconds('00')
            
            if(nextBus.getHours()<5){
                 nextBus.setDate(nextBus.getDate()+1)
            }
            if(nextBus>currentTime){
                let previousIndex = timetables.horarios_vuelta.indexOf(table) -1
                let previous_d = timetables.horarios_vuelta[previousIndex].horas + ':' + timetables.horarios_vuelta[previousIndex].minutos
                previousDeparture.push(previous_d)
                nextDeparture.push(nextBus)
            }
        })
    }

    let hours = String(nextDeparture[0].getHours()).padStart(2,0)
    let minutes = String(nextDeparture[0].getMinutes()).padStart(2,0)
    let next = hours+':'+minutes
    /*
    si: diferencia entre (tiempoactual - tiempoPrevio) > 10
        tonce: 

        if()

    */
    let previous = previousDeparture[0]
    return {previous,next}
}



