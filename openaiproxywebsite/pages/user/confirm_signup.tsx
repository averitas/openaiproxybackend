import React, { MouseEventHandler, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, Box, Button } from '@mui/material'
import Heads from '@/components/Heads'
import UserManager from '@/components/auth/user_manager'

interface Props { }

const ConfirmSignup: React.FC<Props> = () => {
  const { push } = useRouter()

  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [rand, setRand] = useState('')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    const searchParams = new URL(window.location.href).searchParams
    const urlEmail = searchParams.get('email')
    const urlRand = searchParams.get('rand')

    if (urlEmail === null || urlRand === null) {
      push('/')
      return
    }

    setEmail(urlEmail)
    setRand(urlRand)
  })

  const handleConfirmClick = async (event: React.MouseEvent) => {
    event.preventDefault();

    setLoading(true)
    setErrMsg('')

    try {
      const success = await UserManager.instance.confirmSignUp(email, rand)

      if (success) {
        const redirectUrl = `../redirect?msg=${encodeURIComponent('You sign up is completed! Please sign in with you account.')}&url=${encodeURIComponent('./user/signin')}`
        push(redirectUrl)
      } else {
        setErrMsg('Confirm failed!')
        setLoading(false)
      }
    } catch (e) {
      setErrMsg('Confirm failed!')
      setLoading(false)
    }
  }

  return (
    <>
      <Heads />
      <main style={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        margin: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Box style={{
          padding: '20px',
          border: '1px solid #ccc',
        }}>
          <p>Click the button to complete signing up</p>
          {errMsg.length > 0 ? <Alert severity="error">{errMsg}</Alert> : ''}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
            onClick={handleConfirmClick}
          >
            Confirm
          </Button>
        </Box>
      </main>
    </>
  )
}

export default ConfirmSignup