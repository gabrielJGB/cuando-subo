import timetables from './horarios.json' assert {type: 'json'};



function showNext(direction){
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


console.log(showNext('ida'))