
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { completeGoogleLogin } from '../api/client'

export default function OAuthSuccess() {
    const [searchParams] = useSearchParams()
    const [error, setError] = useState('')

    useEffect(() => {
        async function finishLogin() {
            console.log('OAuthSuccess loaded')

            const token = searchParams.get('token')

            console.log('OAuth token exists:', Boolean(token))

            if (!token) {
                setError('Google login did not return a token.')
                return
            }

            try {
                console.log('Calling completeGoogleLogin...')

                const user = await completeGoogleLogin(token)

                console.log('Google user loaded:', user)

                window.location.href = '/'
            } catch (err) {
                console.error('Google login failed:', err)
                setError('Could not complete Google login.')
            }
        }

        finishLogin()
    }, [searchParams])

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-brick">{error}</p>
            </div>
        )
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <p className="text-muted">Signing you in...</p>
        </div>
    )
}

