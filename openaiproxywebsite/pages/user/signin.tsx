import * as React from 'react'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import UserManager from '@/components/auth/user_manager'

function Copyright(props: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="#">
                Lewis
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const theme = createTheme();

const SignIn = () => {
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
            const password = data.get('password') as string || ''
            console.log({
                email,
                password,
            })

            if (email.length === 0 || password.length === 0) {
                setErrMsg('Invalid input!')
                return
            }

            const success = await UserManager.instance.signIn(email, password)

            if (success) {
                push('../')
            } else {
                setErrMsg('Sign in fail!')
                setLoading(false)
            }
        } catch (e) {
            setErrMsg('Sign in fail!')
            setLoading(false)
        }
    };

    return (
        <>
            <Head>
                <title>Azure Openai proxy App</title>
                <meta name="description" content="openai proxy App" />
                <meta name="email" content="lewis0204@outlook.com" />
            </Head>
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
                            Sign in
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
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
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
                                Sign In
                            </Button>
                            <Grid container>
                                <Grid item xs>
                                    <Link href="./forget_password" variant="body2">
                                        Forgot password?
                                    </Link>
                                </Grid>
                                <Grid item>
                                    <Link href="./signup" variant="body2">
                                        {"Don't have an account? Sign Up"}
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

export default SignIn