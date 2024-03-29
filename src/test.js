import timetables_normal from './json/horarios.json' assert {type: 'json'};
import timetables_sun from './json/horarios_domingo.json' assert {type: 'json'};
import timetables_sat from './json/horarios_sabado.json' assert {type: 'json'};

export function getSchedule(direction){
    let nextDeparture = []
    let previousDeparture = []
    let currentTime = new Date()
    let horarios
    let timetables


    if(currentTime.getDay() == 6  || (currentTime.getDay() == 0 && currentTime.getHours() >= 0)){

        timetables = timetables_sat
    }else if(currentTime.getDay() == 0){
        timetables = timetables_sun
    }else{
        timetables = timetables_normal
    }

    if(direction == "ida"){
            horarios = timetables.horarios_ida
    }else{
            horarios = timetables.horarios_vuelta
    }

    horarios.forEach(table=>{    
        let nextBus = new Date()
        nextBus.setHours(table.horas)
        nextBus.setMinutes(table.minutos)
        nextBus.setSeconds('00')
    
        if(nextBus.getHours()<5){
             nextBus.setDate(nextBus.getDate()+1)
        }
        if(nextBus>currentTime){
             let previousIndex = horarios.indexOf(table) -1
            if(previousIndex == -1){
                previousIndex = horarios.length -2
            }
            let previous_d = horarios[previousIndex].horas + ':' + horarios[previousIndex].minutos
            previousDeparture.push(previous_d)
            nextDeparture.push(nextBus)
        }
    })

    let hours = String(nextDeparture[0].getHours()).padStart(2,0)
    let minutes = String(nextDeparture[0].getMinutes()).padStart(2,0)
    let next = hours+':'+minutes
    let previous = previousDeparture[0]

    return {previous,next}
}

