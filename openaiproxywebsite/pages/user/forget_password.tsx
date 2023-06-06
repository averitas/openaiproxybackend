import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Alert, Avatar, Box, Button, Container, CssBaseline, Grid, Link, TextField, Typography } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Heads from '@/components/Heads'
import Copyright from '@/components/Copyright'
import UserManager from '@/components/auth/user_manager'

const theme = createTheme();

const ForgetPassword = () => {
  const { push } = useRouter();

  const [loading, setLoading] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true)
    setErrMsg('')

    try {
      // form validation
      const data = new FormData(event.currentTarget);
      const email = data.get('email') as string || ''

      if (email.length === 0) {
        setErrMsg('Invalid input!')
        return
      }

      const success = await UserManager.instance.sendResetPasswordMail(email)

      if (success) {
        push(`../redirect?msg=${encodeURIComponent('A mail with reset link should be sent to you mail box, please check it!')}&path=${encodeURIComponent('./user/signin')}`)
      } else {
        setErrMsg('Reset password failed!')
        setLoading(false)
      }
    } catch (e) {
      setErrMsg('Reset password failed!')
      setLoading(false)
    }
  };

  return (
    <>
      <Heads />
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Forget password
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                disabled={loading}
              />
              {errMsg.length > 0 ? <Alert severity="error">{errMsg}</Alert> : ''}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                Send reset password email
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="./signin" variant="body2">
                    Go back to Sign In
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="./signup" variant="body2">
                    Sign Up
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Copyright sx={{ mt: 8, mb: 4 }} />
        </Container>
      </ThemeProvider>
    </>
  )
}

export default ForgetPassword