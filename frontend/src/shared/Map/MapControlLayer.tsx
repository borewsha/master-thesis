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
	const { isEditMap, isCreateRoute, isEditMode, currentFigure, figures } =
		useAppSelector(state => state.figures)

	const [startInput, setStartInput] = useState('')
	const [endInput, setEndInput] = useState('')

	const handleAddPoint = (value: string, index: number) => {
		// Не вызываем dispatch при каждом изменении value, только по кнопке
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
			</>
		)
	}

	const MainMenu = () => {
		return !(isEditMap || isCreateRoute) ? (
			<>
				<button
					style={{ display: 'block' }}
					onClick={() => {
						createMultilineHandler(dispatch)
						dispatch(figuresSlice.actions.setIsCreateRoute(true))
					}}
				>
					Построить маршрут
				</button>
				<button
					style={{ display: 'block' }}
					onClick={() => {
						dispatch(figuresSlice.actions.setIsEditMap(true))
					}}
				>
					Редактировать карту
				</button>
			</>
		) : null
	}

	const MapEditingMenu = () => {
		return isEditMap ? (
			<>
				<button
					style={{ display: 'block' }}
					onClick={() => {
						map.setZoom(map.getZoom() - 1)
					}}
				>
					Сохранить
				</button>
				<button
					style={{ display: 'block' }}
					onClick={() => {
						dispatch(figuresSlice.actions.setIsEditMap(true))
					}}
				>
					Отменить
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
				// ref.current!.value = ''
				// ref.current!.focus()
			}
		}

		return isCreateRoute ? (
			<>
				<p>Координаты начала</p>
				<input type='text' placeholder='Координаты начала' ref={startRef} />
				<p>Координаты конца</p>
				<input type='text' placeholder='Координаты конца' ref={endRef} />
				<button
					onClick={() => {
						handleAddPointRef(startRef)
						handleAddPointRef(endRef)
						createGridHandler(dispatch, figures)
					}}
				>
					Построить
				</button>
				<button
					style={{ display: 'block' }}
					onClick={e => {
						e.stopPropagation()
						e.preventDefault()
						dispatch(figuresSlice.actions.setIsCreateRoute(false))
						dispatch(figuresSlice.actions.cancelFigureAdding())
						dispatch(figuresSlice.actions.setEditMode(false))
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
					<MapEditingMenu />
					<CreateRouteMenu />
					{/*{*/}
					{/*	isEditMap ?*/}
					{/*			<>*/}
					{/*				*/}
					{/*			</>*/}
					{/*}*/}
					{/*{isEditMode ? (*/}
					{/*	<>*/}
					{/*		<button onMouseDown={() => saveHandler(dispatch)}>Сохранить</button>*/}
					{/*		<button onMouseDown={() => cancelHandler(dispatch)}>Отменить</button>*/}
					{/*	</>*/}
					{/*) : (*/}
					{/*	<>*/}
					{/*		<button*/}
					{/*			style={{ display: 'block' }}*/}
					{/*			onClick={() => createMultilineHandler(dispatch)}*/}
					{/*		>*/}
					{/*			Добавить multiline*/}
					{/*		</button>*/}
					{/*		<button style={{ display: 'block' }} onClick={() => createPolygonHandler(dispatch)}>*/}
					{/*			Добавить polygon*/}
					{/*		</button>*/}
					{/*		<button style={{ display: 'block' }} onClick={() => createGridHandler(dispatch, figures)}>*/}
					{/*			Построить путь*/}
					{/*		</button>*/}
					{/*	</>*/}
					{/*)}*/}
				</div>
			</div>
		</>
	)
}

export default MapControlLayer
