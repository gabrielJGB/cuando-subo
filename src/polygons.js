
import polygons_ida from './geojson/polygons_ida.json'assert {type: 'json'};
import polygons_vuelta from './geojson/polygons_vuelta.json' assert { type: 'json' };

let arrayPolygonsIda = polygons_ida.features.map(obj =>
    obj.geometry.coordinates[0]
)

let arrayPolygonsVuelta = polygons_vuelta.features.map(obj=>
    obj.geometry.coordinates[0]
)


export function getSegmentNumber(lng, lat, direction) {
    const point = {
        latitude: lat,
        longitude: lng
    };

    let arrayPolygons

    if(direction == 'ida'){
        arrayPolygons = arrayPolygonsIda
    }else{
        arrayPolygons = arrayPolygonsVuelta
    }


    for (let i = 0; i < arrayPolygons.length; i++) {

        if (geolib.isPointInPolygon(point, arrayPolygons[i])) {
            return (i)
        }
    }
  
    return -1
}


