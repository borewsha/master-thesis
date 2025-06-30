import React from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { figuresSlice } from '@/figures.slice'
import Figure from '@/shared/Map/Figure'

const Markers = () => {
	const { isEditMap, figures, currentFigure } = useAppSelector(
		state => state.figures
	)

	return (
		<>
			{currentFigure && <Figure figure={currentFigure} />}
			{figures
				.filter(
					f =>
						f.type === 'way' ||
						f.type === 'polyline' ||
						(isEditMap && f.type === 'polygon')
				)
				.map(f => (
					<Figure key={f.id} figure={f} />
				))}
		</>
	)
}

export default Markers
