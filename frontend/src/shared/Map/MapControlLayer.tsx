import { useMap } from 'react-leaflet'
import React, { useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { figuresSlice } from '@/figures.slice'
import {
	createMultilineHandler,
	createPolygonHandler,
	createGridHandler,
	saveHandler,
	cancelHandler
} from './handlers'
import L from 'leaflet'

const MapControlLayer = () => {
	const map = useMap()
	const dispatch = useAppDispatch()
	const {
		isEditMap,
		isCreateRoute,
		isEditMode,
		currentFigure,
		figures,
		isPolygonsVisible
	} = useAppSelector(state => state.figures)

	const handleAddPoint = (value: string, index: number) => {
		const [lat, lng] = value.split(',').map(Number)
		if (!isNaN(lat) && !isNaN(lng)) {
			dispatch(
				figuresSlice.actions.addPointToCurrentFigure({
					position: { lat, lng }
				})
			)
		}
	}

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
						createMultilineHandler(dispatch)
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
		const [manualEdit, setManualEdit] = React.useState<{start: boolean, end: boolean}>({start: false, end: false})

		// Синхронизация с currentFigure (например, после клика по карте)
		React.useEffect(() => {
			if (currentFigure && currentFigure.points[0] && !manualEdit.start) {
				const { lat, lng } = currentFigure.points[0].position
				const val = `${lat}, ${lng}`
				if (val !== startInput) setStartInput(val)
			}
		}, [currentFigure?.points[0]?.position?.lat, currentFigure?.points[0]?.position?.lng, manualEdit.start])
		React.useEffect(() => {
			if (currentFigure && currentFigure.points[1] && !manualEdit.end) {
				const { lat, lng } = currentFigure.points[1].position
				const val = `${lat}, ${lng}`
				if (val !== endInput) setEndInput(val)
			}
		}, [currentFigure?.points[1]?.position?.lat, currentFigure?.points[1]?.position?.lng, manualEdit.end])

		const handleInputChange = (value: string, index: number) => {
			if (index === 0) {
				setStartInput(value)
				setManualEdit(prev => ({...prev, start: true}))
			}
			if (index === 1) {
				setEndInput(value)
				setManualEdit(prev => ({...prev, end: true}))
			}
		}

		const handleInputBlur = (value: string, index: number) => {
			if (index === 0) setManualEdit(prev => ({...prev, start: false}))
			if (index === 1) setManualEdit(prev => ({...prev, end: false}))
			if (!value.trim()) return
			const [lat, lng] = value.split(',').map(Number)
			if (isNaN(lat) || isNaN(lng)) return
			if (!currentFigure || !currentFigure.points[index]) {
				dispatch(figuresSlice.actions.addPointToCurrentFigure({ position: { lat, lng } }))
			} else if (currentFigure.points[index].id) {
				dispatch(figuresSlice.actions.updatePointPosition({
					figureId: currentFigure.id,
					pointId: currentFigure.points[index].id || '',
					updatedPosition: L.latLng(lat, lng)
				}))
			}
		}

		return isCreateRoute ? (
			<>
				<p>Координаты начала</p>
				<input
					type='text'
					placeholder='Координаты начала'
					ref={startRef}
					value={startInput}
					onChange={e => handleInputChange(e.target.value, 0)}
					onBlur={e => handleInputBlur(e.target.value, 0)}
				/>
				<p>Координаты конца</p>
				<input
					type='text'
					placeholder='Координаты конца'
					ref={endRef}
					value={endInput}
					onChange={e => handleInputChange(e.target.value, 1)}
					onBlur={e => handleInputBlur(e.target.value, 1)}
				/>
				<button
					onMouseDown={() => {
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
				</div>
			</div>
		</>
	)
}

export default MapControlLayer
