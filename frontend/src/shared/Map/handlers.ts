// Обработчики событий для MapControlLayer
import { figuresSlice, Point, Figure } from '@/figures.slice'
import { v4 as uuid } from 'uuid'
import { generateGrid } from '@/entity/grid/lib/generateGrid'
import { aStarMaxWeight } from '@/entity/aStar'
import { fillGridPoints, createExpandedGrid, getGridPerimeter } from './gridUtils'
import { leeAlgorithm } from './leeAlgorithm'
import { AppDispatch } from '@/store'
import { Grid } from '@/entity/grid/types'

export function createMultilineHandler(dispatch: AppDispatch) {
	dispatch(figuresSlice.actions.setEditMode(true))
	dispatch(figuresSlice.actions.startAddingFigure('polyline'))
}

export function createPolygonHandler(dispatch: AppDispatch) {
	dispatch(figuresSlice.actions.setEditMode(true))
	dispatch(figuresSlice.actions.startAddingFigure('polygon'))
}

export function createGridHandler(dispatch: AppDispatch, figures: Figure[]) {
	dispatch(figuresSlice.actions.startAddingFigure('grid'))
	for (const f of figures) {
		if (f.type === 'polyline') {
			const n = 100
			const grid: Grid = generateGrid(n, f)
			fillGridPoints(grid, n, figures)
			const path = leeAlgorithm([...grid], [n, n], [n * 2 - 1, n])
			if (!Array.isArray(path) || path.length === 0) {
				console.error('Path not found')
				continue
			}
			const points: Point[] = path.map(([x, y]) => ({
				position: grid[x][y].position,
				id: grid[x][y].id,
				isFree: true,
				weight: grid[x][y].weight
			}))
			dispatch(figuresSlice.actions.addFigure({
				id: uuid(),
				type: 'way',
				isSelected: false,
				points
			}))
			const newGrid = createExpandedGrid(grid, points)
			const newGridPoints: Point[] = []
			fetch('http://localhost:8000/process_data', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pathPoints: points, gridAroundPath: newGrid })
			})
				.then(res => res.json())
				.then((res: { path: { id: string; lng: number; lat: number; weight: number }[] }) => {
					const data = res.path
					for (let i = 0; i < newGrid.length; i++) {
						for (let j = 0; j < newGrid[i].length; j++) {
							newGrid[i][j].weight = -1000
							const a = data.find((p: any) => p.id === newGrid[i][j].id)
							if (a) {
								newGrid[i][j].weight = a.weight
							}
							newGridPoints.push(newGrid[i][j])
						}
					}
					const path = aStarMaxWeight(
						newGrid,
						grid[n][n],
						points[points.length - 1]
					) || []
					dispatch(figuresSlice.actions.addFigure({
						id: uuid(),
						type: 'grid',
						points: newGridPoints
					}))
					dispatch(figuresSlice.actions.addFigure({
						id: uuid(),
						type: 'way',
						points: path
					}))
				})
			const newGridWay = getGridPerimeter(newGrid)
		}
	}
	saveHandler(dispatch)
}

export function saveHandler(dispatch: AppDispatch) {
	dispatch(figuresSlice.actions.setEditMode(false))
	dispatch(figuresSlice.actions.saveCurrentFigure())
}

export function cancelHandler(dispatch: AppDispatch) {
	dispatch(figuresSlice.actions.setEditMode(false))
	dispatch(figuresSlice.actions.cancelFigureAdding())
}
