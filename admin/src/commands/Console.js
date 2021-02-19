import * as React from "react";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Commands from "./Commands";

export default function CommandsConsole() {
    return (
        <Grid container spacing={3}>
            {/* Commands */}
            <Grid item xs={12}>
                <Commands />
            </Grid>
        </Grid>
    );
}
