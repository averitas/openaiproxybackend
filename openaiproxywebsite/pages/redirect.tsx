import React, { useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/navigation'

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
    }, [])

    return (
        <>
            <Head>
                <title>Azure Openai proxy App</title>
                <meta name="description" content="openai proxy App" />
                <meta name="email" content="lewis0204@outlook.com" />
            </Head>
            {msg.length > 0 ? <p>{msg}</p> : ''}
            <p>Redirecting in {countdown} seconds...</p>
            <p>Or <a href={path} onClick={handleLinkClick}>click here</a> to redirect manually</p>
        </>
    )
}

export default Redirect