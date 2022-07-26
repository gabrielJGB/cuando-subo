
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

    

    if (direction == 'ida') {
    
        for (let i = 0; i < arrayPolygonsIda.length; i++) {

            if (geolib.isPointInPolygon(point, arrayPolygonsIda[i])) {
                return (i)
            }
        }
    }
    else if(direction == 'vuelta'){
    
    	for (let i = 0; i < arrayPolygonsVuelta.length; i++) {
            if (geolib.isPointInPolygon(point, arrayPolygonsVuelta[i])) {
                return (i)
            }
        }
    }
    return -1
}


