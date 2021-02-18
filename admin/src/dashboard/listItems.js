import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DashboardIcon from '@material-ui/icons/Dashboard';
import PeopleIcon from '@material-ui/icons/People';
import GavelIcon from '@material-ui/icons/Gavel';
import DnsIcon from '@material-ui/icons/Dns';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { Link } from "react-router-dom";

export const mainListItems = (
    <div>
        <ListItem button component={Link} to="/admin">
            <ListItemIcon>
                <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Home"  />
        </ListItem>
        <ListItem button component={Link} to="/admin/users">
            <ListItemIcon>
                <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Users" />
        </ListItem>
        <ListItem button component={Link} to="/admin/commands">
            <ListItemIcon>
                <GavelIcon />
            </ListItemIcon>
            <ListItemText primary="Commands" />
        </ListItem>
        <ListItem button component={Link} to="/admin/hosts">
            <ListItemIcon>
                <DnsIcon />
            </ListItemIcon>
            <ListItemText primary="Hosts" />
        </ListItem>
        <ListItem button component={Link} to="/admin/about">
            <ListItemIcon>
                <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="About" />
        </ListItem>
    </div>
);
