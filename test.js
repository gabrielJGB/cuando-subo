import data from './gj-BB-PA.json' assert { type: 'json' };

    // let coordinates = busArray.map(obj => ([
    //     parseFloat(obj.lng), parseFloat(obj.lat)
    // ]))
data.features.shift()

let array = data.features.map(obj=>({
  "coords":{"lng":obj.geometry.coordinates[0],"lat":obj.geometry.coordinates[1]},
  "name":obj.properties.label
}))

array.shift()
console.log(array)