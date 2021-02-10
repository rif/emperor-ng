import * as React from "react";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Users from "./Users";
import Groups from "./Groups";
import UserGroups from "./UserGroups";

export default function Auth() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Users */}
        <Grid item xs={12} md={8} lg={9}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 240 }}
          >
            <Users />
          </Paper>
        </Grid>
        {/* Groups */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{ p: 2, display: "flex", flexDirection: "column", height: 240 }}
          >
            <Groups />
          </Paper>
        </Grid>
        {/* UserGroups */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <UserGroups />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
