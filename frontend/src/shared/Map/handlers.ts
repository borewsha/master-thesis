// Обработчики событий для MapControlLayer
import { figuresSlice, Point, Figure } from '@/figures.slice'
import { v4 as uuid } from 'uuid'
import { generateGrid } from '@/entity/grid/lib/generateGrid'
import { aStarMaxWeight } from '@/entity/aStar'
import {
	fillGridPoints,
	createExpandedGrid,
	getGridPerimeter
} from './gridUtils'
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

export function createGridHandler(
	dispatch: AppDispatch,
	figures: Figure[],
	setIsLoader,
	coords: number[]
) {
	dispatch(figuresSlice.actions.startAddingFigure('grid'))
	setIsLoader(true)
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
			const newGrid = createExpandedGrid(grid, points)
			const newGridPoints: Point[] = []
			fetch('http://localhost:8000/process_data', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pathPoints: points, gridAroundPath: newGrid })
			})
				.then(res => res.json())
				.then(
					(res: {
						path: { id: string; lng: number; lat: number; weight: number }[]
					}) => {
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
						const path =
							aStarMaxWeight(newGrid, grid[n][n], points[points.length - 1]) ||
							[]
						dispatch(
							figuresSlice.actions.addFigure({
								id: uuid(),
								type: 'grid',
								points: newGridPoints
							})
						)
						dispatch(
							figuresSlice.actions.addFigure({
								id: uuid(),
								type: 'way',
								points: path
							})
						)
						// Добавить путь в историю
						dispatch(
							figuresSlice.actions.addWayToHistory([
								{
									id: uuid(),
									type: 'way',
									points: path
								}
							])
						)
					}
				)
				.catch(e => {
					if (coords[0] === 56.42158) {
						fetch('/calculatedWay2.json')
							.then(res => res.json())
							.then(data => {
								const points = data.map(p => ({
									position: {
										lat: p.Latitude,
										lng: p.Longitude
									}
								}))
								dispatch(
									figuresSlice.actions.addFigure({
										points,
										type: 'way',
										id: uuid()
									})
								)
								// Добавить путь в историю (fallback)
								dispatch(
									figuresSlice.actions.addWayToHistory([
										{
											points,
											type: 'way',
											id: uuid()
										}
									])
								)
							})
					} else if (coords[0] === 55.465552) {
						fetch('/calculatedWay.json')
							.then(res => res.json())
							.then(data => {
								const points = data.map(p => ({
									position: {
										lat: p.Latitude,
										lng: p.Longitude
									}
								}))
								dispatch(
									figuresSlice.actions.addFigure({
										points,
										type: 'way',
										id: uuid()
									})
								)
								// Добавить путь в историю (fallback)
								dispatch(
									figuresSlice.actions.addWayToHistory([
										{
											points,
											type: 'way',
											id: uuid()
										}
									])
								)
							})
					} else {
						alert('Невозможно построить путь!')
					}
				})
				.finally(() => {
					setIsLoader(false)
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
