import { useMap } from 'react-leaflet'
import React, { useState } from 'react'
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
	const { isEditMap, isEditMode } = useAppSelector(state => state.figures)

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
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 10
				}}
			>
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
				{!isEditMap && (
					<>
						<button
							style={{ display: 'block' }}
							onClick={() => {
								map.setZoom(map.getZoom() - 1)
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
				)}
				{isEditMap && (
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
				)}
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
	)
}

export default MapControlLayer
