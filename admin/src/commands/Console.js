import * as React from "react";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Commands from "./Commands";


export default function Auth() {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* Commands */}
                <Grid item xs={12}>
                    <Paper
                        sx={{ p: 2, display: "flex", flexDirection: "column", height: 240 }}
                    >
                        <Commands />
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
