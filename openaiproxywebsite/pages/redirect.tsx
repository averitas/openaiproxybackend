import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Heads from '@/components/Heads'

const Redirect = () => {
    const { push } = useRouter()

    const [path, setPath] = React.useState('/')
    const [msg, setMsg] = React.useState('')
    const [countdown, setCountdown] = React.useState(5)

    let timer: any = null

    const handleLinkClick = () => {
        clearInterval(timer)
    }

    useEffect(() => {
        const searchParams = new URL(window.location.href).searchParams
        const path = searchParams.get('path') || '/'
        const queryMsg = searchParams.get('msg') || 'redirecting...'
        setPath(path)
        setMsg(queryMsg)

        let realCountdown = 5;

        timer = setInterval(() => {
            realCountdown = Math.max(realCountdown - 1, 0)
            setCountdown(realCountdown)

            if (realCountdown <= 0) {
                clearInterval(timer)
                push(path)
            }
        }, 1000)

        return () => {
            clearInterval(timer)
        }
    }, [])

    return (
        <>
            <Heads />
            <main style={{
                display: 'flex',
                width: '100%',
                height: '100vh',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div style={{
                    maxWidth: '90%',
                    padding: '20px',
                    border: '1px solid #ccc',
                }}>
                    {
                        msg.length > 0 ?
                            <p style={{
                                textAlign: 'center',
                            }}>{msg}</p>
                            : ''
                    }
                    <div>
                        <p>Redirecting in {countdown} seconds...</p>
                        <p>Or <a href={path} onClick={handleLinkClick}>click here</a> to redirect manually</p>
                    </div>
                </div>
            </main>
        </>
    )
}

export default Redirect