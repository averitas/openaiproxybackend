import * as React from 'react';
import { useRouter } from 'next/navigation'
import { Alert, Avatar, Box, Button, Container, CssBaseline, Grid, Link, TextField, Typography } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Heads from '@/components/Heads'
import Copyright from '@/components/Copyright'
import UserManager from '@/components/auth/user_manager'

const theme = createTheme();

const SignUp = () => {
    const { push } = useRouter()

    const [loading, setLoading] = React.useState(false)
    const [errMsg, setErrMsg] = React.useState('')

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setLoading(true)
        setErrMsg('')

        try {
            // form validation
            const data = new FormData(event.currentTarget);
            const email = data.get('email') as string || ''
            const password = data.get('password') as string || ''
            console.log({
                email,
                password,
            })

            if (email.length === 0 || password.length === 0) {
                setErrMsg('Invalid input!')
                return
            }

            const success = await UserManager.instance.signUp(email, password)

            if (success) {
                const redirectUrl = `../redirect?msg=${encodeURIComponent('Signed up successfully! A confirmation mail will be sent to your email address.')}&url=${encodeURIComponent('./signin')}`
                push(redirectUrl)
            } else {
                setErrMsg('Sign up fail!')
                setLoading(false)
            }
        } catch (e) {
            setErrMsg('Sign up fail!')
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
                            Sign up
                        </Typography>
                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        name="email"
                                        autoComplete="email"
                                        disabled={loading}
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
                                Sign Up
                            </Button>
                            <Grid container justifyContent="flex-end">
                                <Grid item>
                                    <Link href="./signin" variant="body2">
                                        Already have an account? Sign in
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

export default SignUp