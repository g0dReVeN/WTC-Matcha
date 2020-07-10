import React from 'react';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles'
import { Row, Column } from 'simple-flexbox';
import { Link, useHistory } from "react-router-dom";
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import HeaderComponent from './HeaderComponent';
import FooterComponent from './FooterComponent';

const useStyles = makeStyles({
    container: {
        height: '100%',
        minHeight: '100vh',
    },
    mainBlock: {
        backgroundColor: '#FFF',
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.0)), url("/assets/background4.jpg")',
        width: '100%',
        position: 'relative'
    },
    root: {
        width: '100%',
        color: '#ff596a',
        '& label': {
            color: '#ff596a',
            '&.Mui-focused': {
                color: '#ff596a',
            },
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#ff596a',
            },
            '&:hover fieldset': {
                border: '5px solid #ff596a'
            },
            '&.Mui-focused fieldset': {
                border: '5px solid #ff596a'
            },
        },
    },
    form: {
        marginTop: 70,
    },
    field: {
        width: 300,
        margin: '35px 0px 0px 0px',
        backgroundColor: '#FFF',
        color: '#ff596a',
    },
    btn: {
        width: 300,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        margin: '20px 0px 0px 0px',
        color: '#FFF',
        backgroundColor: '#ff596a',
        '&:hover': {
            backgroundColor: 'rgba(255,89,106, 0.9)',
        },
    },
    text: {
        color: '#ff596a',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: '400',
        textDecorationLine: 'none',
        fontSize: '0.875rem',
        lineHeight: '1.43',
        letterSpacing: '0.01071em',
        '&:hover': {
            textDecorationLine: 'underline',
        },
    },
    msg: {
        width: 300,
        // height: 80,
        fontSize: 16,
        // backgroundColor: 'white',
        // wordWrap: 'break-word',
        // color: values.color,
    },
});

const LoginComponent = (props) => {
    const classes = useStyles();
    const history = useHistory();

    const [values, setValues] = React.useState({
        username: '',
        password: '',
        showPassword: false,
        resMsg: '',
    });

    const handleChange = value => event => {
        setValues({ ...values, [value]: event.target.value });
    };

    const handleClickShowPassword = () => {
        setValues({ ...values, showPassword: !values.showPassword });
    };

    const handleMouseDownPassword = event => {
        event.preventDefault();
    };

    const loginUser = event => {
        event.preventDefault();

        const userInfo = {
            username: values.username,
            password: values.password,
        };

        axios.post(process.env.REACT_APP_API_URL + '/login', userInfo)
            .then(res => {
                if (res.status === 200) {
                    localStorage.clear();
                    localStorage.access_token = res.data.token;
                    history.push("/");
                }
            }).catch(err => {
                console.log(err);
                setValues({ resMsg: err.response.data.msg });
            });
    };

    return (
        <Row className={ classes.container }>
            <Column className={ classes.mainBlock } vertical="flex-start" horizontal="center">
                <HeaderComponent />
                <Column className={classes.root} vertical="center" horizontal="center">
                    <form className={classes.form} noValidate autoComplete="off">
                        <Column vertical="center" horizontal="center">
                            <Typography className={classes.msg} style={{ color: 'red' }} >{ values.resMsg }</Typography>
                            <TextField required className={classes.field} label="Username" variant="outlined" value={values.username || ""} onChange={handleChange('username')}/>
                            <FormControl required className={classes.field} variant="outlined">
                                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                                <OutlinedInput
                                    id="outlined-adornment-password"
                                    type={values.showPassword ? 'text' : 'password'}
                                    value={values.password || ""}
                                    onChange={handleChange('password')}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                edge="end"
                                                style={{ color: '#ff596a' }}
                                            >
                                                {values.showPassword ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    labelWidth={70}
                                />
                            </FormControl>
                            <Link className={classes.text} to="/forgotPassword">Forgot Password?</Link>
                            <Button className={classes.btn} onClick={loginUser} variant="contained">Login</Button>
                            <Link to="/register">
                                <Button className={classes.btn} variant="contained">Register</Button>
                            </Link>
                        </Column>
                    </form>
                </Column>
                <FooterComponent />
            </Column>
        </Row>
    );
};

export default LoginComponent;