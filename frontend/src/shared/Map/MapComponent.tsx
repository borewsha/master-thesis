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
	f: number
	g: number
	h: number
	parent: Node | null
}

const MapComponent = ({ zoom = 10, location }: MapProps) => {
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
			.then(figures => {
				dispatch(figuresSlice.actions.clearFigures())
				figures.forEach(figure => {
					dispatch(figuresSlice.actions.addFigure(figure[0]))
				})
			})
	}, [dispatch])

	return (
		location && (
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
			</MapContainer>
		)
	)
}

export default MapComponent
