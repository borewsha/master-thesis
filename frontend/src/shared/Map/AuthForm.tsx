import React, { useState } from 'react'

interface AuthFormProps {
	onAuthSuccess: () => void
	hardcodedLogin?: string
	hardcodedPassword?: string
}

const AuthForm: React.FC<AuthFormProps> = ({
	onAuthSuccess,
	hardcodedLogin = 'user',
	hardcodedPassword = '1234'
}) => {
	const [login, setLogin] = useState('')
	const [password, setPassword] = useState('')
	const [authError, setAuthError] = useState('')

	const handleAuth = (e: React.FormEvent) => {
		e.preventDefault()
		if (login === hardcodedLogin && password === hardcodedPassword) {
			setAuthError('')
			onAuthSuccess()
		} else {
			setAuthError('Неверный логин или пароль')
		}
	}

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100vh',
				background: '#fff',
				zIndex: 2000,
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100vw'
			}}
		>
			<form
				onSubmit={handleAuth}
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 12,
					minWidth: 240
				}}
			>
				<h3>Авторизация</h3>
				<input
					type='text'
					placeholder='Логин'
					value={login}
					onChange={e => setLogin(e.target.value)}
				/>
				<input
					type='password'
					placeholder='Пароль'
					value={password}
					onChange={e => setPassword(e.target.value)}
				/>
				<button type='submit'>Войти</button>
				<button type='button'>Регистрация</button>
				{authError && <div style={{ color: 'red' }}>{authError}</div>}
			</form>
		</div>
	)
}

export default AuthForm
