import React from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { Row } from 'simple-flexbox';

const useStyles = makeStyles(theme => ({
  root: {
    width: 350,
  },
  btn: {
    fontWeight: 'bold',
    fontSize: 13,
    padding: '6px 12px',
    // border: '1px solid',
    // borderColor: '#007bff',
    fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
    ].join(','),
    '&:focus': {
        boxShadow: '0 0.2rem #ff596a',
    },
  },
}));


const UserNotifPanelComponent = (props) => {
    const classes = useStyles();

    return (
      <Row className={classes.root} vertical="center" horizontal="space-evenly">
        <Button className={classes.btn}>History</Button>
        <Button className={classes.btn}>Messages</Button>
        <Button className={classes.btn}>Notifications</Button>
      </Row>
    );
}

export default UserNotifPanelComponent;