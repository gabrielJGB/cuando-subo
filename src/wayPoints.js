import ruta_ida from './geojson/gj-BB-PA-1.json'assert {type: 'json'};
import ruta_vuelta from './geojson/gj-PA-BB.json'assert {type: 'json'};


ruta_ida.features.shift()
export let wayPoints_ida = ruta_ida.features.map(obj => ({
    "coords": {
        "lng": obj.geometry.coordinates[0],
        "lat": obj.geometry.coordinates[1]
    }
}))

ruta_vuelta.features.shift()
export let wayPoints_vuelta = ruta_vuelta.features.map(obj => ({
    "coords": {
        "lng": obj.geometry.coordinates[0],
        "lat": obj.geometry.coordinates[1]
    }
}))
