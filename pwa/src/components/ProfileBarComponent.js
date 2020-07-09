import React from 'react';
import { Row } from 'simple-flexbox';
import { makeStyles } from '@material-ui/core/styles'
import { Link, useHistory } from "react-router-dom";

const useStyles = makeStyles({
    container: {
        // marginLeft: 32,
        // marginRight: 32,
        height: 70,
        backgroundColor: '#ff596a',
        position: 'relavtive'
    },
    proPic: {
        left: 10,
        position: 'absolute',
        backgroundColor: '#FFF',
        // border: '1px solid #FFF',
        border: '5px double #ff596a',
        borderRadius: '50%',
        height: 40,
        width:  40,
        cursor: 'pointer',
    },
    title: {
        left: 70,
        position: 'absolute',
        fontFamily: 'Arial',
        fontStyle: 'normal',
        fontSize: 19,
        fontWeight: 'bold',
        lineHeight: '24px',
        letterSpacing: '0.4px',
        color: '#FFF',
        cursor: 'pointer',
    },
    fameR: {
        right: 60,
        position: 'absolute',
        backgroundColor: '#FFF',
        // textAlign: 'center',
        // textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ff596a',
        fontWeight: 'bold',
        // lineHeight: 2.2,
        // borderBottom: '32px solid #f5f7fa',
        // borderLeft: '8px solid transparent',
        // borderRight: '8px solid transparent',
        // height: 0,
        // width: 32,
        height: 40,
        width:  40,
        border: '5px double #ff596a',
        borderRadius: '50%',
        // ':hover': {
        //     borderBottom: '32px solid #FFF',
        // },
        // cursor: 'pointer',
    },
    logoutB: {
        position: 'absolute',
        left: 300,
        height: 40,
        width:  40,
        // borderRadius: '50%',
        // cursor: 'pointer',
    },
    logout: {
        // ':hover': {
        //     fill: '#000',
        // },
        borderRadius: '50%',
        cursor: 'pointer',
    }
});

export default function ProfileBarComponent(props) {
    console.log(props)
    const classes = useStyles();
    const history = useHistory();

    const logOut = (event) => { 
        localStorage.removeItem('access_token');
        history.push("/login");
    };

    return (
        <Row className={ classes.container } horizontal="start" vertical="center">
            <div className={ classes.proPic }></div>
            <div className={ classes.title }>{ props.username }</div>
            <div className={ classes.fameR }>{ props.fameRating }</div>
            <Link className={ classes.logoutB } to="/login">
                <img className={ classes.logout } src="/assets/logout.svg" alt="Logout" onClick={ logOut } ></img>
            </Link>
        </Row>
    );
}

ProfileBarComponent.defaultProps = {
    username: "My Profile",
    fameRating: 100,
};