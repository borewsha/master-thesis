import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import s from './Map.module.css'
import Markers from '@/shared/Map/Markers'
import MapControlLayer from '@/shared/Map/MapControlLayer'
import { Figure, figuresSlice, FigureType } from '@/figures.slice'
import { v4 as uuid } from 'uuid'
import { useAppDispatch } from '@/store'
import { aStarMaxWeight } from '@/entity/aStar'

interface MapProps {
	zoom?: number
	location?: GeolocationPosition
}

export function mapCoordsListToFigures(
	coordsList: [number, number][][]
): Figure[] {
	return coordsList.map(coords => {
		return {
			id: uuid(),
			type: 'polygon',
			points: coords.map(([lng, lat]) => ({
				id: uuid(), // опционально
				position: { lat, lng }
			}))
		}
	})
}

interface Point {
	weight: number
	lat: number
	lng: number
}

interface Node {
	point: Point
	f: number // f = g + h
	g: number // стоимость пути от старта
	h: number // эвристическая оценка до цели
	parent: Node | null
}

const Map = ({ zoom = 10, location }: MapProps) => {
	const dispatch = useAppDispatch()
	const [isSetStartFinishPoints, setIsSetStartFinishPoints] =
		useState<boolean>(false)

	useEffect(() => {
		fetch('/countries.geojson')
			.then(
				response => response.json(),
				error => console.log(error)
			)
			.then(data =>
				data.features.find(feature => feature.properties.name === 'Denmark')
			)
			.then(denmark => denmark.geometry.coordinates.map(mapCoordsListToFigures))
			.then(figures =>
				figures.forEach(figure => {
					console.log(figure)
					dispatch(figuresSlice.actions.addFigure(figure[0]))
				})
			)
		// fetch('/data.json')
		// 	.then(response => response.json())
		// 	.then(response => {
		// 		console.log(
		// 			aStarMaxWeight(
		// 				response.path,
		// 				{
		// 					lat: 55.339233474507196,
		// 					lng: 10.987140329923633,
		// 					weight: 0.699999988079071
		// 				},
		// 				{
		// 					lat: 55.175459404639156,
		// 					lng: 10.977967296172363,
		// 					weight: 0.022480923682451248
		// 				}
		// 			)
		// 		)
		// 	})
	}, [])

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
