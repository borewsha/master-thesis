import { configureStore, createSelector } from '@reduxjs/toolkit'
import { figuresSlice } from '@/figures.slice'
import { useDispatch, useSelector, useStore } from 'react-redux'

export const store = configureStore({
	reducer: {
		[figuresSlice.name]: figuresSlice.reducer
	}
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppSelector = useSelector.withTypes<AppState>()
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppStore = useStore.withTypes<typeof store>()
export const createAppSelector = createSelector.withTypes<AppState>()
