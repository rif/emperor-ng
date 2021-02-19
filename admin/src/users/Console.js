import * as React from "react";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Users from "./Users";
import Groups from "./Groups";

export default function UsersConsole() {
    return (
        <Grid container spacing={3}>
            {/* Users */}
            <Grid item xs={12} md={8} lg={9}>
                <Users />
            </Grid>
            {/* Groups */}
            <Grid item xs={12} md={4} lg={3}>
                <Groups />
            </Grid>
        </Grid>
    );
}
