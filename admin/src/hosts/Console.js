import * as React from "react";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Hosts from "./Hosts";


export default function HostsConsole() {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* Hosts */}
                <Grid item xs={12}>
                    <Paper
                        sx={{ p: 2, display: "flex", flexDirection: "column", height: 240 }}
                    >
                        <Hosts />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
