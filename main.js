const mainContainer = document.querySelector('.main-container')

export function update(marker,direction){
	if(marker!=null){
		let lat = marker._latlng.lat
		let lng = marker._latlng.lng

		mainContainer.textContent = "Mi ubicación:"+lat+lng+'\n'+direction	
	}
}
