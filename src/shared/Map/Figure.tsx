import React from 'react'
import { Polygon, Polyline } from 'react-leaflet'
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
						positions={figure?.points.map(p => p.position) || []}
						pathOptions={{ color: 'orange' }}
					/>
				}
				{figure?.points.map(p => (
					<CustomMarker
						key={p.id}
						initialPosition={p.position}
						color='orange'
						onDrag={e =>
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
						positions={figure?.points.map(p => p.position) || []}
						pathOptions={{ color: 'blue' }}
					/>
				}
				{figure?.points.map((p, i) => (
					<CustomMarker
						key={p.id}
						initialPosition={p.position}
						color={i === 0 ? 'green' : 'red'}
						onDrag={e =>
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
				{figure?.points.map(p => (
					<CustomMarker
						key={p.id}
						initialPosition={p.position}
						color={p.isFree ? 'green' : 'red'}
						size={10}
						draggable={false}
						onDrag={e =>
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

	const WayView = () => {
		return (
			<Polyline
				positions={figure?.points.map(p => p.position) || []}
				pathOptions={{ color: 'green' }}
			/>
		)
	}

	const GraphEdge = () => {
		return (
			<Polyline
				positions={figure?.points.map(p => p.position) || []}
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
