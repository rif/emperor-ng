import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary">
            {'Copyright © '}
            <Link color="inherit" href="https://material-ui.com/">
                Your Website
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
    },
    main: {
        marginTop: theme.spacing(8),
        marginBottom: theme.spacing(2),
    },
    response: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    footer: {
        padding: theme.spacing(3, 2),
        marginTop: 'auto',
        backgroundColor:
        theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
    },
}));

export default function App() {
    const classes = useStyles();
    const [users, setUsers] = React.useState([]);
    const [hosts, setHosts] = React.useState([]);

    React.useEffect(() => {
        fetch("/adm/availablecommands")
            .then((response) => response.json())
            .then((json) => {
                
            });
        fetch("/adm/availablehosts")
            .then((response) => response.json())
            .then((json) => {
                
            });
    }, []);

    return (
        <div className={classes.root}>
            <CssBaseline />
            <Container component="main" className={classes.main} >
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper>
                            <Card className={classes.response}>
                                <CardContent>
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        className={classes.inline}
                                        color="textPrimary"
                                    >
                                        Ali Connors
                                    </Typography>
                                    {" — I'll be in your neighborhood doing errands this…"}
                                </CardContent>
                            </Card>
                            <Card className={classes.response}>
                                <CardContent>
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        className={classes.inline}
                                        color="textPrimary"
                                    >
                                        to Scott, Alex, Jennifer
                                    </Typography>
                                    {" — Wish I could come, but I'm out of town this…"}
                                </CardContent>
                            </Card>
                            <Card className={classes.response}>
                                <CardContent>
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        className={classes.inline}
                                        color="textPrimary"
                                    >
                                        Sandra Adams
                                    </Typography>
                                    {' — Do you have Paris recommendations? Have you ever…'}
                                </CardContent>
                            </Card>
                        </Paper>
                    </Grid>
                    <Grid item xs={4}>
                        <Autocomplete
                            id="combo-box-demo"
                            options={users}
                            getOptionLabel={(option) => option.title}
                            style={{ width: '100%' }}
                            renderInput={(params) => <TextField {...params} label="Combo box" variant="outlined" />}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <Autocomplete
                            id="combo-box-demo"
                            options={hosts}
                            getOptionLabel={(option) => option.title}
                            style={{ width: '100%' }}
                            renderInput={(params) => <TextField {...params} label="Combo box" variant="outlined" />}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <Autocomplete
                            id="combo-box-demo"
                            options={users}
                            getOptionLabel={(option) => option.title}
                            style={{ width: '100%' }}
                            renderInput={(params) => <TextField {...params} label="Combo box" variant="outlined" />}
                        />
                    </Grid>
                </Grid>
            </Container>
            <footer className={classes.footer}>
                <Container maxWidth="sm">
                    <Typography variant="body1">My sticky footer can be found here.</Typography>
                    <Copyright />
                </Container>
            </footer>
        </div>
    );
}
