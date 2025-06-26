import React from 'react'
import { Polygon, Polyline, Popup } from 'react-leaflet'
import CustomMarker from '@/shared/Map/CustomMarker'
import { useAppDispatch } from '@/store'
import { figuresSlice } from '@/figures.slice'

const Figure = ({ figure }) => {
	const dispatch = useAppDispatch()

	const PolygonView = () => {
		return (
			<>
				{
					<Polygon
						positions={figure?.points.map((p: any) => p.position) || []}
						pathOptions={{ color: 'orange' }}
					/>
				}
				{figure?.points.map((p: any) => (
					<CustomMarker
						key={p.id}
						initialPosition={p.position}
						color='orange'
						size={10}
						onRemove={() => {}}
						onDrag={(e: any) =>
							dispatch(
								figuresSlice.actions.updatePointPosition({
									figureId: figure.id,
									pointId: p.id,
									updatedPosition: e.target._latlng
								})
							)
						}
					/>
				))}
			</>
		)
	}

	const PolylineView = () => {
		return (
			<>
				{
					<Polyline
						positions={figure?.points.map((p: any) => p.position) || []}
						pathOptions={{ color: 'blue' }}
					/>
				}
				{figure?.points.map((p: any, i: number) => (
					<CustomMarker
						key={p.id}
						initialPosition={p.position}
						color={i === 0 ? 'green' : 'red'}
						onRemove={() => {}}
						onDrag={(e: any) =>
							dispatch(
								figuresSlice.actions.updatePointPosition({
									figureId: figure.id,
									pointId: p.id,
									updatedPosition: e.target._latlng
								})
							)
						}
					/>
				))}
			</>
		)
	}

	const GridView = () => {
		return (
			<>
				{figure?.points.map((p: any) => (
					<CustomMarker
						key={p.id}
						initialPosition={p.position}
						color={p.isFree ? 'green' : 'red'}
						size={10}
						draggable={false}
						onRemove={() => {}}
						onDrag={(e: any) =>
							dispatch(
								figuresSlice.actions.updatePointPosition({
									figureId: figure.id,
									pointId: p.id,
									updatedPosition: e.target._latlng
								})
							)
						}
						popup={
							<>
								<p>Вес: {p.weight}</p>
								<p>lat: {p.position.lat}</p>
								<p>lng: {p.position.lng}</p>
								<p>id: {p.id}</p>
							</>
						}
					/>
				))}
			</>
		)
	}

	const WayView = () => {
		return (
			<>
				<Polyline
					positions={figure?.points.map((p: any) => p.position) || []}
					pathOptions={{ color: 'green' }}
				/>
				{/*{figure?.points.map((p: any, i: number) => (*/}
				{/*	<CustomMarker*/}
				{/*		size={10}*/}
				{/*		key={p.id}*/}
				{/*		initialPosition={p.position}*/}
				{/*		color='orange'*/}
				{/*		onRemove={() => {}}*/}
				{/*		popup={*/}
				{/*			<>*/}
				{/*				<p>Вес: {p.weight}</p>*/}
				{/*				<p>lat: {p.position.lat}</p>*/}
				{/*				<p>lng: {p.position.lng}</p>*/}
				{/*				<p>id: {p.id}</p>*/}
				{/*			</>*/}
				{/*		}*/}
				{/*		draggable={false}*/}
				{/*	/>*/}
				{/*))}*/}
			</>
		)
	}

	const GraphEdge = () => {
		return (
			<Polyline
				positions={figure?.points.map((p: any) => p.position) || []}
				pathOptions={{ color: 'black' }}
			/>
		)
	}

	return (
		<>
			{figure?.type === 'polygon' && <PolygonView />}
			{figure?.type === 'polyline' && <PolylineView />}
			{figure?.type === 'grid' && <GridView />}
			{figure?.type === 'way' && <WayView />}
			{figure?.type === 'graphEdge' && <GraphEdge />}
		</>
	)
}

export default Figure
