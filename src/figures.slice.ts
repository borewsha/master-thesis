import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LatLng } from 'leaflet'
import { v4 as uuid } from 'uuid'

export type Point = {
	id?: string
	position: LatLng | { lat: number; lng: number }
	isFree?: boolean
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
	figures: [
		{
			id: '0ff6ad79-447c-4228-86ae-493636a866b3',
			type: 'polygon',
			points: [
				{
					id: '08c6a812-aefc-423f-8d43-44601d56726b',
					position: {
						lat: 54.72247159610213,
						lng: 10.693399546535405
					}
				},
				{
					id: '4f25e0dd-9673-406d-bdcc-17cb63d3efdb',
					position: {
						lat: 54.727625736910475,
						lng: 10.717768812471153
					}
				},
				{
					id: '8cb6b50a-9f5c-4c54-a72b-ad193a961a1e',
					position: {
						lat: 54.74328237444462,
						lng: 10.736989641941546
					}
				},
				{
					id: '63554bca-e1ec-449d-a64f-b83ab8ca5bf3',
					position: {
						lat: 54.75635796477404,
						lng: 10.741108391113789
					}
				},
				{
					id: '85f2d27c-33e7-4d99-b6dc-7f955f8db07e',
					position: {
						lat: 54.764676596759024,
						lng: 10.74522714028603
					}
				},
				{
					id: '4717b212-4c42-48bf-820f-948e9e78566c',
					position: {
						lat: 54.80703546505639,
						lng: 10.7678802607333
					}
				},
				{
					id: 'd6592b2b-7829-45e0-9883-43680597b10a',
					position: {
						lat: 54.822859163942205,
						lng: 10.776804217273149
					}
				},
				{
					id: '784ac47b-82af-43eb-9bc6-9aa5be4cdec2',
					position: {
						lat: 54.829384634051344,
						lng: 10.775431300882415
					}
				},
				{
					id: '124f037d-0107-4dc4-bec0-6006454e41c3',
					position: {
						lat: 54.887276662036996,
						lng: 10.814902647116316
					}
				},
				{
					id: '595cba7e-8ac7-4276-bdbf-e4cd50e38b09',
					position: {
						lat: 54.9040557299219,
						lng: 10.816275563507048
					}
				},
				{
					id: 'ce56b4c6-1c2e-4148-a60d-8583a43148f2',
					position: {
						lat: 54.90859474667835,
						lng: 10.817648479897784
					}
				},
				{
					id: '71c99b6a-4408-4425-a673-62487e502b69',
					position: {
						lat: 54.91589556942353,
						lng: 10.825885978242265
					}
				},
				{
					id: '67e7dbba-f626-46cb-9cd9-1e9dcd98c99d',
					position: {
						lat: 54.93384601375181,
						lng: 10.833780247489045
					}
				},
				{
					id: '70ad94ad-51d4-4779-bc32-db00bec70bf9',
					position: {
						lat: 54.98745235399982,
						lng: 10.88766721582577
					}
				},
				{
					id: '4af5f0d6-ae25-44e0-a904-c2f70e15976c',
					position: {
						lat: 54.99670796818608,
						lng: 10.895218255974848
					}
				},
				{
					id: 'ef849fd1-ff1e-472c-bcd4-7956bb9ef08f',
					position: {
						lat: 55.082703262367374,
						lng: 10.935066734858136
					}
				},
				{
					id: 'a91a4db1-2c7b-474d-8b8a-f33dd83595f3',
					position: {
						lat: 55.146327007707,
						lng: 10.955669284404006
					}
				},
				{
					id: 'a21edec3-9501-45ac-89eb-b39d4e101869',
					position: {
						lat: 55.15907604224671,
						lng: 10.954639597110935
					}
				},
				{
					id: 'e0fffd72-721d-4afd-ae96-177d1e7a64d8',
					position: {
						lat: 55.16495883787746,
						lng: 10.943656265984982
					}
				},
				{
					id: '16c86816-9e67-4643-8028-dc03a3ce2551',
					position: {
						lat: 55.16495883787746,
						lng: 10.937478142226642
					}
				},
				{
					id: 'e75e521e-559a-4945-92e1-a03081dee37f',
					position: {
						lat: 55.139656658819426,
						lng: 10.900066170578844
					}
				},
				{
					id: '991fd778-5cbe-48b2-9eb7-442e83d33a51',
					position: {
						lat: 55.101771488117244,
						lng: 10.874667217350067
					}
				},
				{
					id: 'ff6163f3-858d-4511-9464-bffb0998570c',
					position: {
						lat: 55.062653344280356,
						lng: 10.860223592037448
					}
				},
				{
					id: '1b59cd35-43c7-44ca-8f37-441b831b7867',
					position: {
						lat: 55.04318704408131,
						lng: 10.84752411542306
					}
				},
				{
					id: '06631fe0-9288-4388-b1a2-bd753e402033',
					position: {
						lat: 55.02095636612149,
						lng: 10.82761682775726
					}
				},
				{
					id: 'af174f02-7b10-40aa-a360-7eadbe0c13e7',
					position: {
						lat: 55.0034385648621,
						lng: 10.813887663849801
					}
				},
				{
					id: 'fb48e1d9-c9e3-407d-969b-75bd1503720a',
					position: {
						lat: 54.989064318076565,
						lng: 10.797755896258577
					}
				},
				{
					id: '6f02a5e0-fa1a-4e9e-a77a-5a88c8214614',
					position: {
						lat: 54.982170729492296,
						lng: 10.769954339345997
					}
				},
				{
					id: 'e69b1289-6192-45d4-8213-c8c733cded83',
					position: {
						lat: 54.955372974693994,
						lng: 10.723618411158348
					}
				},
				{
					id: '99621596-b65d-442e-8f55-3388e0e1fa10',
					position: {
						lat: 54.94609333572949,
						lng: 10.71295367754421
					}
				},
				{
					id: '4db1b12d-5ee6-42e8-9680-a35464a5d1c6',
					position: {
						lat: 54.937812033199,
						lng: 10.701627117320557
					}
				},
				{
					id: '6b4cfae7-f661-4304-a086-169f59f8efc5',
					position: {
						lat: 54.92124431048481,
						lng: 10.682749516947824
					}
				},
				{
					id: 'bcb80405-c1ab-410c-ae2f-839f89c0cfff',
					position: {
						lat: 54.909603377480394,
						lng: 10.673825560407973
					}
				},
				{
					id: '916ad338-beea-4378-9009-219543360621',
					position: {
						lat: 54.89794689780132,
						lng: 10.680902544194407
					}
				},
				{
					id: 'daa90474-110e-4595-88dd-60047d9e9255',
					position: {
						lat: 54.901006320745154,
						lng: 10.686050980659678
					}
				},
				{
					id: '128d8e6d-ac7e-47d4-9456-28924e005560',
					position: {
						lat: 54.89952598382922,
						lng: 10.688796813441185
					}
				},
				{
					id: '9440610a-b6b4-48e1-afde-3dcd93e327e0',
					position: {
						lat: 54.89755211661932,
						lng: 10.696691082687966
					}
				},
				{
					id: 'd5e6ceda-a6be-48c3-a245-5efbb5018c90',
					position: {
						lat: 54.90702579689883,
						lng: 10.705443424678963
					}
				},
				{
					id: 'be8698fa-fda4-409e-a93c-b35b33ee6a10',
					position: {
						lat: 54.90584170876125,
						lng: 10.70818925746043
					}
				},
				{
					id: '0dd5053a-c517-4cf9-8519-9e3810640c17',
					position: {
						lat: 54.901105007937936,
						lng: 10.706644726520846
					}
				},
				{
					id: '4cf48ca3-4821-4ece-b6e3-28a2956ec548',
					position: {
						lat: 54.89774950769408,
						lng: 10.706816341069699
					}
				},
				{
					id: '958489be-7a77-40a9-b3f2-91ec5ddc4457',
					position: {
						lat: 54.89577555340828,
						lng: 10.717971286744499
					}
				},
				{
					id: 'a45240f1-da89-4f7a-b8b4-1e26536926ed',
					position: {
						lat: 54.893307974491414,
						lng: 10.711449933888455
					}
				},
				{
					id: '0c51dda2-3edb-43a7-9fd9-508712f409da',
					position: {
						lat: 54.88452216640333,
						lng: 10.713680923023448
					}
				},
				{
					id: 'd148ed30-afda-474d-b92c-34d4a4f975ea',
					position: {
						lat: 54.88086907554802,
						lng: 10.722090035916741
					}
				},
				{
					id: '871b8b4e-32e1-4e2b-91d6-c08dbaf88052',
					position: {
						lat: 54.880079174519175,
						lng: 10.726723628735497
					}
				},
				{
					id: 'bfa1728b-5df6-496d-a964-0516aca9f50d',
					position: {
						lat: 54.87761063400684,
						lng: 10.727238472382014
					}
				},
				{
					id: 'e518df50-e879-4d75-82da-7f5243eaefa0',
					position: {
						lat: 54.87721565349259,
						lng: 10.720545504977157
					}
				},
				{
					id: 'd0a15213-607b-49aa-9643-72711fcab445',
					position: {
						lat: 54.87632693318199,
						lng: 10.711793162986156
					}
				},
				{
					id: 'dbc647ab-e6cb-455c-867d-7f12beb0efb9',
					position: {
						lat: 54.879881696842666,
						lng: 10.70904733020465
					}
				},
				{
					id: 'ffa25b25-4f62-43f2-a1ba-106a58cff3ff',
					position: {
						lat: 54.88077033876616,
						lng: 10.704756966483597
					}
				},
				{
					id: '4453bb74-7eb5-434f-b44b-ef013754503b',
					position: {
						lat: 54.87958547851339,
						lng: 10.701153060957871
					}
				},
				{
					id: 'c0da1100-2f8e-4c7e-b8b5-f7a1a70701f4',
					position: {
						lat: 54.876129437118266,
						lng: 10.704413737385892
					}
				},
				{
					id: '020c769f-cb6b-402a-8820-0c9ae4dc0d4d',
					position: {
						lat: 54.871092960501144,
						lng: 10.702182748250939
					}
				},
				{
					id: '4c3f3fc4-c1cc-4ba4-9086-571bea2f10d1',
					position: {
						lat: 54.873463145536505,
						lng: 10.695833009943746
					}
				},
				{
					id: 'db3345c4-1190-479a-a935-d87b315efebc',
					position: {
						lat: 54.876228185271096,
						lng: 10.691885875320356
					}
				},
				{
					id: '29ef1fe8-79fb-4354-84d3-47a038372970',
					position: {
						lat: 54.88235009824454,
						lng: 10.69325879171109
					}
				},
				{
					id: 'c2bbcfdd-da95-4dd9-9ffa-0d9022327ffa',
					position: {
						lat: 54.880967812087924,
						lng: 10.688281969794671
					}
				},
				{
					id: '23a91ceb-0123-47e1-b888-6288ac3a59b1',
					position: {
						lat: 54.87820309752012,
						lng: 10.685192907915498
					}
				},
				{
					id: '837ae8f3-7d72-41a5-9ebf-5809efecadb5',
					position: {
						lat: 54.883041223541376,
						lng: 10.682961918780505
					}
				},
				{
					id: '61cc2f6d-9993-4b7f-990b-80068d89e136',
					position: {
						lat: 54.88383106650815,
						lng: 10.674724420436062
					}
				},
				{
					id: '6d4c35c0-29be-4c40-bbed-06e07a43b98d',
					position: {
						lat: 54.87810435420609,
						lng: 10.66751660938465
					}
				},
				{
					id: 'da9d2dab-19a8-4b54-a1ec-dc976235cc35',
					position: {
						lat: 54.851533615822184,
						lng: 10.662539787468189
					}
				},
				{
					id: '7ba10176-e5b6-49bc-aed2-c4fdd8982174',
					position: {
						lat: 54.84896451232133,
						lng: 10.666830151189282
					}
				},
				{
					id: '94725457-9936-4e06-bf8f-06c6a33d29b1',
					position: {
						lat: 54.8462964239783,
						lng: 10.661510100175118
					}
				},
				{
					id: 'eeb044de-3c3d-4014-9345-319c8b8d70e2',
					position: {
						lat: 54.834930367726116,
						lng: 10.650355154500316
					}
				},
				{
					id: 'b1b1ae1e-f6f1-481a-9055-8760c749bb13',
					position: {
						lat: 54.82978988256462,
						lng: 10.644005416193162
					}
				},
				{
					id: '11e54c74-a6d6-4eef-bb19-38bbbb84a0ee',
					position: {
						lat: 54.83315104309116,
						lng: 10.642289270704724
					}
				},
				{
					id: '21d664a4-3979-4129-9a56-f5dcf0b39aab',
					position: {
						lat: 54.85262049497558,
						lng: 10.579821574925852
					}
				},
				{
					id: 'f48b29df-d71d-45bb-9bc3-769f1989949e',
					position: {
						lat: 54.83087734747556,
						lng: 10.601616622628903
					}
				},
				{
					id: '171c0219-a248-4633-a0a2-780ebd2fe786',
					position: {
						lat: 54.82099022552639,
						lng: 10.630447866834555
					}
				},
				{
					id: '7e6b579d-8384-47f1-984d-21efd546ba11',
					position: {
						lat: 54.8019012343745,
						lng: 10.654817132770262
					}
				},
				{
					id: '1409cf3a-640b-4fe1-8e24-43d9050070c7',
					position: {
						lat: 54.77943787149711,
						lng: 10.659279111040167
					}
				},
				{
					id: '3a5a8080-1b29-4955-9987-7a81eb1a2fc2',
					position: {
						lat: 54.76131955335998,
						lng: 10.672321816752259
					}
				},
				{
					id: '42f5157f-3346-4aeb-a243-0c7122c0e728',
					position: {
						lat: 54.74893898903875,
						lng: 10.666658536640432
					}
				},
				{
					id: 'e4646865-ac2e-42bd-8c96-8eec56206027',
					position: {
						lat: 54.73942814507424,
						lng: 10.66751660938465
					}
				},
				{
					id: 'd92ac700-4576-4773-ba86-a2cb77d33334',
					position: {
						lat: 54.7239682597921,
						lng: 10.685192907915498
					}
				}
			]
		}
	]
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
