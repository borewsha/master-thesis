import { useMap } from 'react-leaflet'
import React from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { figuresSlice, Point } from '@/figures.slice'
import { v4 as uuid } from 'uuid'
import { generateGrid } from '@/entity/grid/lib/generateGrid'
import { isPointInPolygon } from '@/entity/grid/lib/isPointInPolygon'
import * as turf from '@turf/turf'
import { Grid, GridCoordinate } from '@/entity/grid/types'
import { LatLng } from 'leaflet'

interface SafetyGraphNode {
	id: string
	position: LatLng
	type: 'main' | 'buffer'
}

interface SafetyGraphEdge {
	from: string
	to: string
}

const MapControlLayer = () => {
	const map = useMap()
	const dispatch = useAppDispatch()
	const isEditMode = useAppSelector(state =>
		figuresSlice.selectors.getIsEditMode(state)
	)
	const figures = useAppSelector(state =>
		figuresSlice.selectors.getFigures(state)
	)

	const createMultilineHandler = () => {
		dispatch(figuresSlice.actions.setEditMode(true))
		dispatch(figuresSlice.actions.startAddingFigure('polyline'))
	}

	const createPolygonHandler = () => {
		dispatch(figuresSlice.actions.setEditMode(true))
		dispatch(figuresSlice.actions.startAddingFigure('polygon'))
	}

	const packageDataToDownload = data => {
		// Преобразуем данные в JSON строку
		const jsonString = JSON.stringify(data, null, 2)

		// Создаем Blob объект
		const blob = new Blob([jsonString], { type: 'application/json' })

		// Создаем URL для Blob
		const url = URL.createObjectURL(blob)

		// Создаем временную ссылку и имитируем клик
		const link = document.createElement('a')
		link.href = url
		link.download = 'data.json' // Имя файла
		document.body.appendChild(link)
		link.click()

		// Убираем ссылку и освобождаем память
		document.body.removeChild(link)
		URL.revokeObjectURL(url)
	}

	function buildSafetyGraph(
		grid: Grid,
		path: GridCoordinate[]
	): {
		nodes: SafetyGraphNode[]
		edges: SafetyGraphEdge[]
		corridor: turf.Feature<turf.Polygon>
	} {
		let totalDist = 0
		for (let i = 1; i < path.length; i++) {
			const [x1, y1] = path[i - 1]
			const [x2, y2] = path[i]
			const pos1 = grid[x1][y1].position
			const pos2 = grid[x2][y2].position

			const dx = pos1.lat - pos2.lat
			const dy = pos1.lng - pos2.lng
			totalDist += Math.sqrt(dx * dx + dy * dy)
		}
		const bufferDistance = totalDist / (path.length - 1)

		const pathLine = turf.lineString(
			path.map(([x, y]) => [grid[x][y].position.lng, grid[x][y].position.lat])
		)

		const corridor = turf.buffer(pathLine, bufferDistance, { units: 'degrees' })

		// 3. Генерируем узлы графа
		const nodes: SafetyGraphNode[] = []
		for (let index = 1; index < path.length; index++) {
			const [x, y] = path[index - 1]
			const pos = grid[x][y].position as LatLng

			if (index === 1) {
				nodes.push({
					id: `${x},${y}_main`,
					position: new LatLng(pos.lat, pos.lng),
					type: 'main'
				})
				continue
			}

			const [nextX, nextY] = path[index]
			const nextPos = grid[nextX][nextY].position

			const dx = nextPos.lng - pos.lng
			const dy = nextPos.lat - pos.lat

			// Перпендикулярное направление
			const perpDx = -dy
			const perpDy = dx
			const length = Math.sqrt(perpDx * perpDx + perpDy * perpDy)

			const totalWidth = path.length - 1 // ширина графа

			// по ширине: создаем равномерно N узлов (с учетом main узла в центре)
			for (let i = 0; i < totalWidth; i++) {
				const offsetFactor = i - Math.floor(totalWidth / 2)
				const offsetLng = (perpDx / length) * bufferDistance * offsetFactor
				const offsetLat = (perpDy / length) * bufferDistance * offsetFactor

				nodes.push({
					id: `${x},${y}_${i === Math.floor(totalWidth / 2) ? 'main' : 'buffer'}_${i}`,
					position: new LatLng(pos.lat + offsetLat, pos.lng + offsetLng),
					type: i === Math.floor(totalWidth / 2) ? 'main' : 'buffer'
				})
			}

			if (index + 1 === path.length) {
				nodes.push({
					id: `${nextX},${nextY}_main`,
					position: new LatLng(nextPos.lat, nextPos.lng),
					type: 'main'
				})
			}
		}

		// console.log('nodes filled', nodes)

		const pathLen = path.length - 1

		// 4. Создаем ребра графа
		const edges: SafetyGraphEdge[] = []
		for (let i = 0; i < path.length; i++) {
			edges.push({ from: nodes[0].id, to: nodes[i].id })
		}

		for (let i = 1; i < nodes.length - path.length; i++) {
			const from = nodes[i].id
			let nodeEdges = 3

			if (i % pathLen === 0) {
				nodeEdges -= 1
				for (let j = 0; j < nodeEdges; j++) {
					const to = nodes[i + pathLen + j - 1].id
					edges.push({ from, to })
				}
				continue
			}

			if (i % pathLen === 1) {
				nodeEdges -= 1
				for (let j = 0; j < nodeEdges; j++) {
					const to = nodes[i + pathLen + j].id
					edges.push({ from, to })
				}
				continue
			}

			for (let j = 0; j < nodeEdges; j++) {
				const to = nodes[i + pathLen + j - 1].id
				edges.push({ from, to })
			}
		}

		for (let i = nodes.length - path.length; i < nodes.length; i++) {
			edges.push({ from: nodes[i].id, to: nodes[nodes.length - 1].id })
		}

		// console.log('edges filled', edges)

		return {
			nodes,
			edges,
			corridor
		}
	}

	// original
	function leeAlgorithm(
		grid: Grid,
		start: GridCoordinate,
		end: GridCoordinate
	) {
		const rows = grid.length
		const cols = grid[0].length
		const directions = [
			[0, 1],
			[1, 0],
			[0, -1],
			[-1, 0],

			[1, 1],
			[1, -1],
			[-1, 1],
			[-1, -1]
		]

		const queue = [start]
		grid[start[0]][start[1]].weight = 1
		const prev = Array.from({ length: rows }, () => Array(cols).fill(null))

		while (queue.length > 0) {
			const gridCoordinate = queue.shift()
			if (!gridCoordinate) {
				continue
			}
			const [x, y] = gridCoordinate

			for (const [dx, dy] of directions) {
				const newX = x + dx
				const newY = y + dy

				if (
					newX >= 0 &&
					newX < rows &&
					newY >= 0 &&
					newY < cols &&
					grid[newX][newY].weight === 0
				) {
					grid[newX][newY].weight = grid[x][y].weight + 1
					queue.push([newX, newY])
					prev[newX][newY] = [x, y]

					if (newX === end[0] && newY === end[1]) {
						return reconstructPath(prev, start, end)
					}
				}
			}
		}

		return [] // Путь не найден
	}

	function reconstructPath(
		prev: GridCoordinate[][],
		start: GridCoordinate,
		end: GridCoordinate
	): Array<number[]> {
		const path = []
		let [x, y] = end

		while (x !== start[0] || y !== start[1]) {
			path.push([x, y])
			;[x, y] = prev[x][y]
		}

		path.push(start)
		path.reverse()
		return path
	}

	const fillGridPoints = (grid: Grid, size: number) => {
		for (let i = -size; i < size * 2; i++) {
			for (let j = -size; j < size; j++) {
				const position = grid[i + size][j + size].position

				const ins = figures
					.filter(f1 => f1.type === 'polygon')
					.map(f1 => isPointInPolygon({ position }, f1))

				const isInside = ins.some(i => i)
				grid[i + size][j + size].weight = isInside ? -1 : 0

				// Распечатка сетки
				// dispatch(
				// 	figuresSlice.actions.addPointToCurrentFigure({
				// 		position,
				// 		isFree: !isInside
				// 	})
				// )
			}
		}
	}

	function createExpandedGrid(originalGrid, path) {
		if (path.length === 0) return originalGrid

		// Находим минимальные и максимальные координаты пути
		let minLat = path[0].position.lat
		let maxLat = path[0].position.lat
		let minLng = path[0].position.lng
		let maxLng = path[0].position.lng

		for (const point of path) {
			minLat = Math.min(minLat, point.position.lat)
			maxLat = Math.max(maxLat, point.position.lat)
			minLng = Math.min(minLng, point.position.lng)
			maxLng = Math.max(maxLng, point.position.lng)
		}

		// Находим индексы крайних точек в оригинальной сетке
		let minRowIndex = originalGrid.length - 1
		let maxRowIndex = 0
		let minColIndex = originalGrid[0].length - 1
		let maxColIndex = 0

		for (let i = 0; i < originalGrid.length; i++) {
			for (let j = 0; j < originalGrid[i].length; j++) {
				const cell = originalGrid[i][j]
				if (
					cell.position.lat >= minLat &&
					cell.position.lat <= maxLat &&
					cell.position.lng >= minLng &&
					cell.position.lng <= maxLng
				) {
					minRowIndex = Math.min(minRowIndex, i)
					maxRowIndex = Math.max(maxRowIndex, i)
					minColIndex = Math.min(minColIndex, j)
					maxColIndex = Math.max(maxColIndex, j)
				}
			}
		}

		// Расширяем область на 1 клетку в каждую сторону
		const expandedMinRow = Math.max(0, minRowIndex - 1)
		const expandedMaxRow = Math.min(originalGrid.length - 1, maxRowIndex + 1)
		const expandedMinCol = Math.max(0, minColIndex - 1)
		const expandedMaxCol = Math.min(originalGrid[0].length - 1, maxColIndex + 1)

		// Создаем новую сетку
		const newGrid = []
		for (let i = expandedMinRow; i <= expandedMaxRow; i++) {
			const row = []
			for (let j = expandedMinCol; j <= expandedMaxCol; j++) {
				row.push({ ...originalGrid[i][j] })
			}
			newGrid.push(row)
		}

		return newGrid
	}

	function getGridPerimeter(grid) {
		if (grid.length === 0 || grid[0].length === 0) return []

		const perimeter = []
		const rows = grid.length
		const cols = grid[0].length

		// Верхняя граница (слева направо)
		for (let j = 0; j < cols; j++) {
			perimeter.push({ ...grid[0][j].position })
		}

		// Правая граница (сверху вниз, исключая первый элемент)
		for (let i = 1; i < rows; i++) {
			perimeter.push({ ...grid[i][cols - 1].position })
		}

		// Нижняя граница (справа налево, если есть более 1 строки, исключая первый элемент)
		if (rows > 1) {
			for (let j = cols - 2; j >= 0; j--) {
				perimeter.push({ ...grid[rows - 1][j].position })
			}
		}

		// Левая граница (снизу вверх, если есть более 1 столбца, исключая первый и последний элементы)
		if (cols > 1) {
			for (let i = rows - 2; i > 0; i--) {
				perimeter.push({ ...grid[i][0].position })
			}
		}

		return perimeter
	}

	const createGridHandler = () => {
		dispatch(figuresSlice.actions.startAddingFigure('grid'))

		for (const f of figures) {
			if (f.type === 'polyline') {
				// Для лучшего результата - от 100
				const n = 20
				const grid = generateGrid(n, f)
				// console.log(grid)
				fillGridPoints(grid, n)

				// const graph = buildNavigationGraph(grid, [n, n], [n * 2 - 1, n], 5)
				// console.log(graph)

				const path = leeAlgorithm([...grid], [n, n], [n * 2 - 1, n])
				// console.log('path', path)
				if (path.length === 0) {
					console.error('Path not found')
					continue
				}

				// Преобразуем в массив точек
				const points = path.map(([x, y]) => ({
					position: grid[x][y].position,
					id: uuid(),
					isFree: true
				}))

				// Путь
				dispatch(
					figuresSlice.actions.addFigure({
						id: uuid(),
						type: 'way',
						isSelected: false,
						points
					})
				)

				// console.log('grid', grid)
				console.log('points', points)

				const newGrid = createExpandedGrid(grid, points)
				// console.log('newGrid', newGrid)

				packageDataToDownload({ pathPoints: points, gridAroundPath: newGrid })

				fetch('http://localhost:8000/process_data', {
					method: 'POST',
					body: JSON.stringify({ pathPoints: points, gridAroundPath: newGrid })
				})
					.then(res => res.json())
					.then(res => {
						const data = res.path
						for (let i = 0; i < newGrid.length; i++) {
							for (let j = 0; j < newGrid[i].length; j++) {
								for (let k = 0; k < data.length; k++) {
									const a = data.find(p => p.id === newGrid[i][j].id)
									if (a) {
										newGrid[i][j].weight = a.weight
									}
								}
							}
						}

						const path = aStarMaxWeight(
							newGrid,
							points[0],
							points[points.length - 1]
						)
						dispatch(
							figuresSlice.actions.addFigure({
								id: uuid(),
								type: 'way',
								points: path
							})
						)
					})

				// const newGridWay = getGridPerimeter(newGrid)
				// console.log('newGridWay', newGridWay)

				// графница сетки
				// dispatch(
				// 	figuresSlice.actions.addFigure({
				// 		id: uuid(),
				// 		type: 'way',
				// 		isSelected: false,
				// 		points: newGridWay.map(a => ({
				// 			position: a,
				// 			id: uuid(),
				// 			isFree: true
				// 		}))
				// 	})
				// )

				// console.log('POINTS: ', points)

				// Строим граф безопасности
				// const { nodes, edges, corridor } = buildSafetyGraph(grid, path)
				//
				// // Путь
				// const nodesPoints = nodes.map(
				// 	node =>
				// 		({
				// 			position: node.position
				// 		}) as Point
				// )
				// dispatch(
				// 	figuresSlice.actions.addFigure({
				// 		id: uuid(),
				// 		type: 'grid',
				// 		isSelected: false,
				// 		points: nodesPoints
				// 	})
				// )

				// console.log('nodes', nodes, 'edges', edges, 'corridor', corridor)

				// edges.forEach(({ from, to }) => {
				// 	const fromNode = nodes.find(node => node.id === from)
				// 	const toNode = nodes.find(node => node.id === to)
				//
				// 	if (fromNode?.position && toNode?.position) {
				// 		const fromPoint = {
				// 			position: fromNode.position,
				// 			id: from,
				// 			isFree: true
				// 		} as Point
				//
				// 		const toPoint = {
				// 			position: toNode.position,
				// 			id: to,
				// 			isFree: true
				// 		} as Point
				//
				// 		// dispatch(
				// 		// 	figuresSlice.actions.addFigure({
				// 		// 		id: uuid(),
				// 		// 		type: 'graphEdge',
				// 		// 		isSelected: false,
				// 		// 		points: [fromPoint, toPoint]
				// 		// 	})
				// 		// )
				// 	}
				// })

				// packageDataToDownload({ nodes, edges })
			}
		}

		saveHandler()
	}

	const saveHandler = () => {
		dispatch(figuresSlice.actions.setEditMode(false))
		dispatch(figuresSlice.actions.saveCurrentFigure())
	}

	const cancelHandler = () => {
		dispatch(figuresSlice.actions.setEditMode(false))
		dispatch(figuresSlice.actions.cancelFigureAdding())
	}

	return (
		<div
			style={{
				backgroundColor: '#fff',
				position: 'absolute',
				top: 20,
				right: 20,
				padding: 20,
				zIndex: 1000,
				borderRadius: 8,
				border: '1px solid blue'
			}}
		>
			<div style={{}}>
				<button
					style={{ display: 'block' }}
					onClick={() => {
						map.setZoom(map.getZoom() + 1)
					}}
				>
					Плюс
				</button>
				<button
					style={{ display: 'block' }}
					onClick={() => {
						map.setZoom(map.getZoom() - 1)
					}}
				>
					Минус
				</button>
				{isEditMode ? (
					<>
						<button onMouseDown={saveHandler}>Сохранить</button>
						<button onMouseDown={cancelHandler}>Отменить</button>
					</>
				) : (
					<>
						<button
							style={{ display: 'block' }}
							onClick={createMultilineHandler}
						>
							Добавить multiline
						</button>
						<button style={{ display: 'block' }} onClick={createPolygonHandler}>
							Добавить polygon
						</button>
						<button style={{ display: 'block' }} onClick={createGridHandler}>
							Построить путь
						</button>
					</>
				)}
			</div>
		</div>
	)
}

export default MapControlLayer
