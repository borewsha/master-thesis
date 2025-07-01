import { useMap } from 'react-leaflet'
import React, { useState, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { figuresSlice } from '@/figures.slice'
import {
	createMultilineHandler,
	createPolygonHandler,
	createGridHandler,
	saveHandler,
	cancelHandler
} from './handlers'

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

	const [startInput, setStartInput] = useState('')
	const [endInput, setEndInput] = useState('')
	const [isAddPolygon, setIsAddPolygon] = useState<boolean>(false)

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
					<p>Включить/выключить сушу</p>
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
						dispatch(
							figuresSlice.actions.addPointToCurrentFigure({
								position: {
									lat: 55.465552,
									lng: 10.917272
								}
							})
						)
						dispatch(
							figuresSlice.actions.addPointToCurrentFigure({
								position: {
									lat: 55.05376,
									lng: 10.640052
								}
							})
						)
						dispatch(figuresSlice.actions.saveCurrentFigure())
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

		const handleAddPointRef = (ref: React.RefObject<HTMLInputElement>) => {
			const value = ref.current?.value || ''
			const [lat, lng] = value.split(',').map(Number)
			if (!isNaN(lat) && !isNaN(lng)) {
				dispatch(
					figuresSlice.actions.addPointToCurrentFigure({
						position: { lat, lng }
					})
				)
			}
		}

		const getPointsCoordinates = (index: number) => {
			const polyline = figures.find(f => f.type === 'polyline')
			if (polyline?.points[index]) {
				return (
					polyline?.points[index]?.position?.lat +
					', ' +
					polyline?.points[index]?.position?.lng
				)
			}
			if (currentFigure?.points[index]) {
				return (
					currentFigure?.points[index]?.position?.lat +
					', ' +
					currentFigure?.points[index]?.position?.lng
				)
			}
			return ''
		}

		return isCreateRoute ? (
			<>
				<p>Координаты начала</p>
				<input
					type='text'
					placeholder='Координаты начала'
					ref={startRef}
					onChange={e => {
						setStartInput(e.target.value)
					}}
					value={getPointsCoordinates(0) || startInput}
				/>
				<p>Координаты конца</p>
				<input
					type='text'
					placeholder='Координаты конца'
					ref={endRef}
					onChange={e => {
						setEndInput(e.target.value)
					}}
					value={getPointsCoordinates(1) || endInput}
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
