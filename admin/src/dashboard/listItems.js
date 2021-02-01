import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import LayersIcon from '@material-ui/icons/Layers';
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
        <ListItem button component={Link} to="/users">
        <ListItemIcon>
        <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Users" />
        </ListItem>
        <ListItem button component={Link} to="/about">
        <ListItemIcon>
        <AssignmentIcon />
        </ListItemIcon>
        <ListItemText primary="About" />
        </ListItem>
        </div>
);

