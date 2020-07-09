import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

// const useStyles = makeStyles({
//   root: {
//     width: 200,
//     color: '#52af77',
//   },
//   track: {
//     height: 8,
//     borderRadius: 4,
//   },
//   rail: {
//     height: 8,
//     borderRadius: 4,
//   },
// });

const CustomSlider = withStyles({
  root: {
    color: '#ff596a',
    height: 8,
    width: 200,
  },
  thumb: {
    height: 18,
    width: 18,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    // marginTop: 
    // marginLeft: -12,
    '&:focus,&:hover,&$active': {
      boxShadow: 'inherit',
    },
  },
  // active: {},
  // valueLabel: {
  //   left: 'calc(-50% + 4px)',
  // },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);

function valuetext(value) {
  return value;
}

const FilterBarComponent = (props) => {
  // const classes = useStyles();

  const [value, setValue] = React.useState(props.value);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div style={{ padding: props.space }}>
        <Typography style={{ color: '#ff596a', fontWeight: 'bolder' }} id="range-slider" align='center'>
            {props.label}
        </Typography>
        <CustomSlider
        min={props.min}
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
        aria-labelledby="range-slider"
        getAriaValueText={valuetext}
      />
    </div>
  );
};

FilterBarComponent.defaultProps = {
  min: 0,
};

export default FilterBarComponent;