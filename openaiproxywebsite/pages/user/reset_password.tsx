import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { Alert, Avatar, Box, Button, Container, CssBaseline, Grid, Link, TextField, Typography } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Heads from '@/components/Heads'
import Copyright from '@/components/Copyright'
import UserManager from '@/components/auth/user_manager'

const theme = createTheme();

const ResetPassword = () => {
    const { push } = useRouter()

    const [email, setEmail] = React.useState('')
    const [rand, setRand] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [errMsg, setErrMsg] = React.useState('')

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
    }, [])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setLoading(true)
        setErrMsg('')

        try {
            // form validation
            const data = new FormData(event.currentTarget);
            const password = data.get('password') as string || ''

            if (password.length === 0) {
                setErrMsg('Invalid input!')
                return
            }

            const success = await UserManager.instance.resetPassword(email, password, rand)

            if (success) {
                const redirectUrl = `../redirect?msg=${encodeURIComponent('Reset successfully! Please sign in with your new password!')}&url=${encodeURIComponent('./user/signin')}`
                push(redirectUrl)
            } else {
                setErrMsg('Reset failed!')
                setLoading(false)
            }
        } catch (e) {
            setErrMsg('Reset failed!')
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
                            Reset password
                        </Typography>
                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        name="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => {
                                            // do nothing
                                        }}
                                        inputProps={{ readOnly: true }
                                        }
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="password"
                                        label="Password"
                                        type="password"
                                        id="password"
                                        autoComplete="new-password"
                                        disabled={loading}
                                    />
                                </Grid>
                            </Grid>
                            {errMsg.length > 0 ? <Alert severity="error">{errMsg}</Alert> : ''}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading}
                            >
                                Reset password
                            </Button>
                            <Grid container>
                                <Grid item xs>
                                    <Link href="./signin" variant="body2">
                                        Sign In
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
                    <Copyright sx={{ mt: 5 }} />
                </Container>
            </ThemeProvider>
        </>
    )
}

export default ResetPassword