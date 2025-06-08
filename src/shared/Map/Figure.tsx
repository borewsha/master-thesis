import React from 'react'
import { Polygon, Polyline } from 'react-leaflet'
import CustomMarker from '@/shared/Map/CustomMarker'
import { useAppDispatch } from '@/store'
import { figuresSlice } from '@/figures.slice'

const Figure = ({ figure }) => {
	const dispatch = useAppDispatch()
	const colorIndexRef = React.useRef(0)
	function getRandomHexColor() {
		const color = colorIndexRef.current % 2 === 0 ? 'green' : 'red'
		colorIndexRef.current++
		return color
	}

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
					/>
				))}
			</>
		)
	}

	const WayView = () => {
		return (
			<Polyline
				positions={figure?.points.map((p: any) => p.position) || []}
				pathOptions={{ color: getRandomHexColor() }}
			/>
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
