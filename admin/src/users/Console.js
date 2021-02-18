import * as React from "react";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Users from "./Users";
import Groups from "./Groups";

export default function UsersConsole() {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* Users */}
                <Grid item xs={12}>
                    <Users />
                </Grid>
                {/* Groups */}
                <Grid item xs={12}>
                    <Groups />
                </Grid>
            </Grid>
        </Container>
    );
}
