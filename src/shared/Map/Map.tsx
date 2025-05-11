import React, { useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import s from './Map.module.css'
import Markers from '@/shared/Map/Markers'
import MapControlLayer from '@/shared/Map/MapControlLayer'

interface MapProps {
	zoom?: number
	location?: GeolocationPosition
}

const Map = ({ zoom = 13, location }: MapProps) => {
	const [isSetStartFinishPoints, setIsSetStartFinishPoints] =
		useState<boolean>(false)

	return (
		location && (
			// <div className={s.mapWrapper}>
			<MapContainer
				center={[location.coords.latitude, location.coords.longitude]}
				zoom={zoom}
				className={s.map}
				attributionControl={false}
				zoomControl={false}
			>
				<Markers isSetWay={isSetStartFinishPoints} />
				<TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
				<MapControlLayer />
				{/*<CustomMarker*/}
				{/*	initialPosition={[*/}
				{/*		location.coords.latitude,*/}
				{/*		location.coords.longitude*/}
				{/*	]}*/}
				{/*	color='gray'*/}
				{/*	draggable={false}*/}
				{/*/>*/}
				{/*<Way color='orange' points={points} />*/}
			</MapContainer>
			// </div>
		)
	)
}

export default Map
