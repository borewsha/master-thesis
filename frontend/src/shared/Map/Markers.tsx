import React from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { useMapEvents } from 'react-leaflet'
import { figuresSlice } from '@/figures.slice'
import Figure from '@/shared/Map/Figure'

const Markers = () => {
	const dispatch = useAppDispatch()
	const { isEditMap, figures, currentFigure, isEditMode, isPolygonsVisible } =
		useAppSelector(state => state.figures)

	useMapEvents({
		click(e) {
			if (isEditMode) {
				dispatch(
					figuresSlice.actions.addPointToCurrentFigure({ position: e.latlng })
				)
			}
		}
	})

	return (
		<>
			{currentFigure && <Figure figure={currentFigure} />}
			{figures
				.filter(
					f =>
						f.type === 'way' ||
						f.type === 'polyline' ||
						(isPolygonsVisible && f.type === 'polygon')
				)
				.map(f => (
					<Figure key={f.id} figure={f} />
				))}
		</>
	)
}

export default Markers
