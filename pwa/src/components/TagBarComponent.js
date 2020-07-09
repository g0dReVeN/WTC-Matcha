import React from 'react';
import CreatableSelect from 'react-select/creatable';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    root: {
        width: 200,
        paddingBottom: 10,
    },
});

// const scaryAnimals = [
//     { label: "Alligators", value: 1 },
//     { label: "Crocodiles", value: 2 },
//     { label: "Sharks", value: 3 },
//     { label: "Small crocodiles", value: 4 },
//     { label: "Smallest crocodiles", value: 5 },
//     { label: "Snakes", value: 6 },
// ];

const TagBarComponent = (props) => {
    const classes = useStyles();

    const handleChange = (newValue, actionMeta) => {
        // console.group('Value Changed');
        // console.log(newValue);
        // console.log(`action: ${actionMeta.action}`);
        // console.groupEnd();
    };

    const colourStyles = {
        // container: (styles, state) => ({
        //     ...styles,
        //     backgroundColor: '#FFF',
        //     // border: '2px solid #ff596a',
        //     border: state.isSelected && '2px solid black',
        //     // color: state.isSelected ? 'white' : 'black',
        // }),
        control: (styles, state) => ({
            ...styles,
            backgroundColor: '#FFF',
            border: '2px solid #ff596a',
        }),
        multiValue: styles => {
            return {
                ...styles,
                backgroundColor: 'rgba(254,88,107,0.10)', 
            };
        },
        multiValueLabel: styles => ({
            ...styles,
            color: '#ff596a',
        }),
        multiValueRemove: styles => ({
            ...styles,
            color: '#ff596a',
            ':hover': {
                backgroundColor: '#ff596a',
                color: 'white',
            },
        }),
        clearIndicator: styles => ({
            ...styles,
            color: '#ff596a',
        }),
        dropdownIndicator: styles => ({
            ...styles,
            color: '#ff596a',
        }),
        placeholder: styles => ({
            ...styles,
            color: '#ff596a',
        }),
    };

    return (
        <div className={classes.root}>
            <div className="container">
                <Typography style={{ color: '#ff596a', fontWeight: 'bolder' }} align='center'>
                    {props.label}
                </Typography>
                <CreatableSelect isMulti styles={colourStyles} onChange={handleChange} />
            </div>
        </div>
    );
};

export default TagBarComponent;