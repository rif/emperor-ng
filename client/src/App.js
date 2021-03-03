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
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

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
    const [commands, setCommands] = React.useState([]);
    const [command, setCommand] = React.useState(null);
    const [hosts, setHosts] = React.useState([]);
    const [host, setHost] = React.useState(null);
    const [params, setParams] = React.useState('');
    const [watch, setWatch] = React.useState(false);
    
    const handleExecute = (e) => {
        console.log(host, command, params);
        fetch(`/execute?csrf=${window.csrf}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                hostId: host.id,
                commandId: command.id,
                params: params,
            }),
        })
            .then((resp) => resp.text())
            .then((text) => {
                console.log(text);
            });
    };

    React.useEffect(() => {
        fetch("/availabledata")
            .then((response) => response.json())
            .then((json) => {
                setCommands(json.commands);
                setHosts(json.hosts);
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
                    <Grid item xs={3}>
                        <Autocomplete
                            id="combo-box-demo"
                            options={hosts}
                            getOptionLabel={(option) => option.name}
                            style={{ width: '100%' }}
                            onChange={(e,v) => setHost(v)}
                            renderInput={(params) => <TextField {...params} label="Host" variant="outlined" />}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <Autocomplete
                            id="combo-box-demo"
                            options={commands}
                            getOptionLabel={(option) => `${option.description} (${option.address})`}
                            style={{ width: '100%' }}
                            onChange={(e,v) => setCommand(v)}
                            renderInput={(params) => <TextField {...params} label="Command" variant="outlined" />}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <TextField {...params} label="Params" variant="outlined" onChange={(e) => setParams(e.target.value)} />
                    </Grid>
                    <Grid item xs={1}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={watch}
                                    onChange={(e) => setWatch(e.target.checked)}
                                    name="checked"
                                    color="primary"
                                />
                            }
                            label="Watch"
                        />
                    </Grid>
                    <Grid item xs={2}>
                            <Button variant="outlined" color="primary" size="large" onClick={handleExecute}>Execute</Button>
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
