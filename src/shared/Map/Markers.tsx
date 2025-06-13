import React from 'react'
import { useMapEvents } from 'react-leaflet'
import { useAppDispatch, useAppSelector } from '@/store'
import { figuresSlice } from '@/figures.slice'
import Figure from '@/shared/Map/Figure'

const Markers = () => {
	const dispatch = useAppDispatch()
	const isEditMode = useAppSelector(state =>
		figuresSlice.selectors.getIsEditMode(state)
	)
	const figures = useAppSelector(state =>
		figuresSlice.selectors.getFigures(state)
	)

	useMapEvents({
		click(e) {
			if (isEditMode) {
				dispatch(
					figuresSlice.actions.addPointToCurrentFigure({ position: e.latlng })
				)
			}
		}
	})

	const currentFigure = useAppSelector(state =>
		figuresSlice.selectors.getCurrentFigure(state)
	)

	return (
		<>
			{currentFigure && <Figure figure={currentFigure} />}
			{figures
				// .filter(f => f.type === 'way' || f.type === 'polyline')
				.map(f => (
					<Figure key={f.id} figure={f} />
				))}
		</>
	)
}

export default Markers
