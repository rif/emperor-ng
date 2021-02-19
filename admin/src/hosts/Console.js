import * as React from "react";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Hosts from "./Hosts";


export default function HostsConsole() {
    return (
        <Grid container spacing={3}>
            {/* Hosts */}
            <Grid item xs={12}>
                <Hosts />
            </Grid>
        </Grid>
    );
}
