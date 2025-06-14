import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LatLng } from 'leaflet'
import { v4 as uuid } from 'uuid'

export type Point = {
	id?: string
	position: LatLng | { lat: number; lng: number }
	isFree?: boolean
	weight?: number
}

export type FigureType =
	| 'polygon'
	| 'polyline'
	| 'grid'
	| 'way'
	| 'graphEdge'
	| 'point'

export type FigureId = string

export type Figure = {
	id: FigureId
	type: FigureType
	points: Point[]
	isSelected?: boolean
}

export interface FiguresState {
	isEditMode: boolean
	currentFigure: Figure | null
	figures: Figure[]
}

const initialState: FiguresState = {
	isEditMode: false,
	currentFigure: null,
	figures: []
}

export const figuresSlice = createSlice({
	name: 'figures',
	initialState,
	selectors: {
		getIsEditMode: state => state.isEditMode,
		getFigures: state => state.figures,
		getCurrentFigure: state => state.currentFigure
	},
	reducers: {
		setEditMode: (state, action: PayloadAction<boolean>) => {
			state.isEditMode = action.payload
		},
		startAddingFigure: (state, action: PayloadAction<FigureType>) => {
			state.currentFigure = {
				id: uuid(),
				type: action.payload,
				points: [],
				isSelected: false
			}
		},
		addPointToCurrentFigure: (state, action: PayloadAction<Point>) => {
			const { position, isFree } = action.payload
			state.currentFigure?.points.push({
				id: uuid(),
				position,
				isFree
			})
		},
		cancelFigureAdding: state => {
			state.currentFigure = null
		},
		saveCurrentFigure: state => {
			if (state.currentFigure) {
				state.figures.push(Object.assign(state.currentFigure))
			}
			state.currentFigure = null
		},
		updatePointPosition: (
			state,
			action: PayloadAction<{
				figureId: string
				pointId: string
				updatedPosition: LatLng
			}>
		) => {
			const { figureId, pointId, updatedPosition } = action.payload
			const figure = state.figures.find(f => f.id === figureId)
			const point = figure?.points.find(p => p.id === pointId)
			if (point) {
				point.position = updatedPosition
			}
		},
		removeFigure: (state, action: PayloadAction<FigureId>) => {
			state.figures = state.figures.filter(
				figure => figure.id !== action.payload
			)
		},
		addFigure: (state, action: PayloadAction<Figure>) => {
			state.figures.push(action.payload)
		},
		selectFigure: (state, action: PayloadAction<FigureId>) => {
			state.figures
				.filter(figure => figure.id === action.payload)
				.map(figure => (figure.isSelected = true))
		}
	}
})
