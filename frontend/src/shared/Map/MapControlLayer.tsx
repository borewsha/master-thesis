import { useMap } from 'react-leaflet'
import React, { useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { figuresSlice, Point } from '@/figures.slice'
import {
	createMultilineHandler,
	createPolygonHandler,
	createGridHandler,
	saveHandler,
	cancelHandler
} from './handlers'
import L from 'leaflet'
import figure from '@/shared/Map/Figure'

const MapControlLayer = () => {
	const map = useMap()
	const dispatch = useAppDispatch()
	const {
		isEditMap,
		isCreateRoute,
		isEditMode,
		currentFigure,
		figures,
		isPolygonsVisible,
		history
	} = useAppSelector(state => state.figures)

	const DefaultMenu = () => {
		return (
			<>
				<button
					style={{ display: 'block' }}
					onClick={() => {
						map.setZoom(map.getZoom() + 1)
					}}
				>
					Приблизить карту
				</button>
				<button
					style={{ display: 'block' }}
					onClick={() => {
						map.setZoom(map.getZoom() - 1)
					}}
				>
					Отдалить карту
				</button>
				<div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
					<input
						type='checkbox'
						checked={isPolygonsVisible}
						onMouseDown={() => {
							dispatch(
								figuresSlice.actions.setIsPolygonVisible(!isPolygonsVisible)
							)
						}}
					/>
					<p>Включить/выключить отборажение препятствий</p>
				</div>
			</>
		)
	}

	const MainMenu = () => {
		return !(isEditMap || isCreateRoute) ? (
			<>
				<button
					style={{ display: 'block' }}
					onClick={() => {
						dispatch(figuresSlice.actions.setIsCreateRoute(true))
					}}
				>
					Построить маршрут
				</button>
			</>
		) : null
	}

	const CreateRouteMenu = () => {
		const startRef = useRef<HTMLInputElement>(null)
		const endRef = useRef<HTMLInputElement>(null)
		const [startInput, setStartInput] = React.useState('')
		const [endInput, setEndInput] = React.useState('')
		const [manualEdit, setManualEdit] = React.useState<{
			start: boolean
			end: boolean
		}>({ start: false, end: false })

		// Синхронизация с currentFigure (например, после клика по карте)
		React.useEffect(() => {
			if (currentFigure && currentFigure.points[0] && !manualEdit.start) {
				const { lat, lng } = currentFigure.points[0].position
				const val = `${lat}, ${lng}`
				if (val !== startInput) setStartInput(val)
			}
		}, [
			currentFigure?.points[0]?.position?.lat,
			currentFigure?.points[0]?.position?.lng,
			manualEdit.start
		])
		React.useEffect(() => {
			if (currentFigure && currentFigure.points[1] && !manualEdit.end) {
				const { lat, lng } = currentFigure.points[1].position
				const val = `${lat}, ${lng}`
				if (val !== endInput) setEndInput(val)
			}
		}, [
			currentFigure?.points[1]?.position?.lat,
			currentFigure?.points[1]?.position?.lng,
			manualEdit.end
		])

		const handleInputChange = (value: string, index: number) => {
			if (index === 0) {
				setStartInput(value)
				setManualEdit(prev => ({ ...prev, start: true }))
			}
			if (index === 1) {
				setEndInput(value)
				setManualEdit(prev => ({ ...prev, end: true }))
			}
		}

		const handleInputBlur = (value: string, index: number) => {
			if (index === 0) setManualEdit(prev => ({ ...prev, start: false }))
			if (index === 1) setManualEdit(prev => ({ ...prev, end: false }))
			if (!value.trim()) return
			const [lat, lng] = value.split(',').map(Number)
			if (isNaN(lat) || isNaN(lng)) return
			if (!currentFigure || !currentFigure.points[index]) {
				dispatch(
					figuresSlice.actions.addPointToCurrentFigure({
						position: { lat, lng }
					})
				)
			} else if (currentFigure.points[index].id) {
				dispatch(
					figuresSlice.actions.updatePointPosition({
						figureId: currentFigure.id,
						pointId: currentFigure.points[index].id || '',
						updatedPosition: L.latLng(lat, lng)
					})
				)
			}
		}

		const getPoints = (index: number) => {
			const figure = figures.find(f => f.type === 'polyline')
			if (figure) {
				const coordinate = figure.points[index].position
				return coordinate.lat + ', ' + coordinate.lng
			}
		}

		return isCreateRoute ? (
			<>
				<p>Координаты начала</p>
				<input
					type='text'
					placeholder='Координаты начала'
					ref={startRef}
					value={getPoints(0) || startInput}
					onChange={e => handleInputChange(e.target.value, 0)}
					onBlur={e => handleInputBlur(e.target.value, 0)}
				/>
				<p>Координаты конца</p>
				<input
					type='text'
					placeholder='Координаты конца'
					ref={endRef}
					value={getPoints(1) || endInput}
					onChange={e => handleInputChange(e.target.value, 1)}
					onBlur={e => handleInputBlur(e.target.value, 1)}
				/>
				<button
					onMouseDown={() => {
						const startPositionArray = startInput.trim().split(',')
						console.log('startPositionArray', startPositionArray)
						const startPosition = {
							lat: +startPositionArray[0],
							lng: +startPositionArray[1]
						}
						const endPositionArray = endInput.trim().split(',')
						const endPosition = {
							lat: +endPositionArray[0],
							lng: +endPositionArray[1]
						}
						dispatch(figuresSlice.actions.startAddingFigure('polyline'))
						console.log('startPosition', startPosition)
						dispatch(
							figuresSlice.actions.addPointToCurrentFigure({
								position: startPosition
							})
						)
						console.log('endPosition', endPosition)
						dispatch(
							figuresSlice.actions.addPointToCurrentFigure({
								position: endPosition
							})
						)
						dispatch(figuresSlice.actions.saveCurrentFigure())
					}}
					onMouseUp={() => {
						createGridHandler(dispatch, figures)
					}}
				>
					Построить
				</button>
				<button
					style={{ display: 'block' }}
					onMouseDown={e => {
						dispatch(figuresSlice.actions.setIsCreateRoute(false))
					}}
				>
					Назад
				</button>
			</>
		) : null
	}

	async function downloadJSON(data, filename = 'data.json') {
		// Преобразуем данные в JSON-строку
		const jsonData = JSON.stringify(data, null, 2)

		// Создаем Blob (бинарный объект) с данными
		const blob = new Blob([jsonData], { type: 'application/json' })

		// Создаем URL для Blob
		const url = URL.createObjectURL(blob)

		// Создаем ссылку для скачивания
		const a = document.createElement('a')
		a.href = url
		a.download = filename

		// Добавляем ссылку в DOM, кликаем и удаляем
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)

		// Освобождаем память, удаляя URL
		URL.revokeObjectURL(url)
	}

	function downloadCSV(data, filename = 'data.csv') {
		// Преобразуем данные в CSV-формат
		const csvContent = convertToCSV(data)

		// Создаем Blob и скачиваем
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = filename
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	}

	// Рекурсивно преобразует любую структуру в CSV
	function convertToCSV(data) {
		if (Array.isArray(data)) {
			return arrayToCSV(data)
		} else if (typeof data === 'object' && data !== null) {
			return objectToCSV(data)
		} else {
			// Примитивы (числа, строки, булевы)
			return String(data)
		}
	}

	// Обрабатывает массив объектов (или примитивов)
	function arrayToCSV(array) {
		if (array.length === 0) return ''

		// Если элементы — примитивы, просто объединяем через запятую
		if (typeof array[0] !== 'object' || array[0] === null) {
			return array
				.map(item => `"${String(item).replace(/"/g, '""')}"`)
				.join(',')
		}

		// Для массивов объектов собираем все возможные ключи
		const allKeys = Array.from(
			array.reduce((keys, item) => {
				if (item && typeof item === 'object') {
					Object.keys(item).forEach(key => keys.add(key))
				}
				return keys
			}, new Set())
		)

		// Заголовки CSV
		const headers = allKeys.join(',')
		const rows = array.map(item => {
			if (!item || typeof item !== 'object') return ''
			return allKeys
				.map(key => {
					const value = item[key]
					return formatCSVValue(value)
				})
				.join(',')
		})

		return [headers, ...rows].join('\n')
	}

	// Обрабатывает одиночный объект (ключи -> заголовки, значения -> строка)
	function objectToCSV(obj) {
		const keys = Object.keys(obj)
		const headers = keys.join(',')
		const row = keys.map(key => formatCSVValue(obj[key])).join(',')
		return [headers, row].join('\n')
	}

	// Экранирует значение для CSV
	function formatCSVValue(value) {
		if (value === null || value === undefined) return ''
		if (typeof value === 'object') {
			// Вложенные объекты/массивы преобразуем в JSON-строку
			return `"${JSON.stringify(value).replace(/"/g, '""')}"`
		}
		// Экранируем кавычки и оборачиваем строки в ""
		return `"${String(value).replace(/"/g, '""')}"`
	}

	// Пример использования:
	// downloadCSV([{ name: "John", age: 30 }, { name: "Alice", age: 25 }], "users.csv");
	// Или можно передать уже готовую CSV-строку:
	// downloadCSV("name,age\nJohn,30\nAlice,25", "users.csv");

	// Добавим отображение истории путей
	const HistoryBlock = () => (
		<div style={{ marginTop: 20 }}>
			<h4>История маршрутов</h4>
			{history.length === 0 && (
				<div style={{ color: '#888' }}>Нет сохранённых маршрутов</div>
			)}
			{history.map((ways, idx) => (
				<div key={idx} style={{ marginBottom: 8 }}>
					Маршрут #{idx + 1}:{' '}
					{ways.map(w => {
						const start = w.points[0]
						const end = w.points[w.points.length - 1]
						const res = `[${start.position.lat}, ${start.position.lng}] - [${end.position.lat}, ${end.position.lng}]`
						return (
							<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
								<p>{res}</p>
								<button
									onClick={() => {
										downloadJSON(w)
									}}
								>
									Скачать в формате JSON
								</button>
								<button
									onClick={() => {
										downloadCSV(w)
									}}
								>
									Скачать в формате CSV
								</button>
								<p>------</p>
							</div>
						)
					})}
				</div>
			))}
			{history.length > 0 && (
				<button
					style={{ marginTop: 8 }}
					onClick={() => dispatch(figuresSlice.actions.clearHistory())}
				>
					Очистить историю
				</button>
			)}
		</div>
	)

	return (
		<>
			{(isEditMap || isCreateRoute) && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						width: '100vw',
						height: '100vh',
						zIndex: 999,
						pointerEvents: 'auto',
						background: 'transparent'
					}}
				/>
			)}
			<div
				style={{
					backgroundColor: 'rgba(255,255,255,0.98)',
					position: 'absolute',
					top: 20,
					right: 20,
					padding: 20,
					zIndex: 1000,
					borderRadius: 8,
					border: '1px solid blue',
					width: 320,
					pointerEvents: 'auto'
				}}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: 10
					}}
				>
					<DefaultMenu />
					<MainMenu />
					<CreateRouteMenu />
					{isEditMode ? (
						<>
							<button
								onMouseDown={e => {
									dispatch(figuresSlice.actions.saveCurrentFigure())
									setTimeout(() => {
										dispatch(figuresSlice.actions.setEditMode(false))
									}, 250)
								}}
							>
								Сохранить
							</button>
							<button onMouseDown={() => cancelHandler(dispatch)}>
								Отменить
							</button>
						</>
					) : (
						<>
							{!isCreateRoute && (
								<>
									<button
										disabled={isEditMode}
										style={{ display: 'block' }}
										onClick={e => {
											createPolygonHandler(dispatch)
										}}
									>
										Добавить препятствие
									</button>
								</>
							)}
						</>
					)}
					<HistoryBlock />
				</div>
			</div>
		</>
	)
}

export default MapControlLayer
