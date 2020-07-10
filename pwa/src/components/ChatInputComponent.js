import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import SendIcon from '@material-ui/icons/Send';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 350,
    borderTop: '1px solid #ff596a',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    color: "#ff596a",
  },
  iconButton: {
    padding: 10,
    color: "#ff596a",
  },
  divider: {
    height: 28,
    margin: 4,
    backgroundColor: "#ff596a",
  },
}));

export default (props) => {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <InputBase
        className={classes.input}
        placeholder="Type a message..."
        value={props.message}
        inputProps={{ type: 'text' }}
        onChange={e => { props.handleInputChange(e.target.value); }}
      />
      <Divider className={classes.divider} orientation="vertical" />
      <IconButton type="submit" className={classes.iconButton} aria-label="search">
        <SendIcon />
      </IconButton>
    </Paper>
  );
}