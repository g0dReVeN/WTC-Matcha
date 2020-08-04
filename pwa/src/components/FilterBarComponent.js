import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";

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
		color: "#ff596a",
		height: 8,
		width: 200,
	},
	thumb: {
		height: 18,
		width: 18,
		backgroundColor: "#fff",
		border: "2px solid currentColor",
		// marginTop:
		// marginLeft: -12,
		"&:focus,&:hover,&$active": {
			boxShadow: "inherit",
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

function valuetext(filter) {
	return filter;
}

const FilterBarComponent = (props) => {
	// const classes = useStyles();

	const { filter, setFilter, order, setOrder, id } = props;

	const handleChange = (event, newValue) => {
		setFilter(id, newValue);
	};

	const handleClick = (event) => {
		event.preventDefault();

		if (order.includes(id)) {
			setOrder(
				order.filter((key) => {
					return key !== id;
				})
			);
		} else {
			setOrder([...order, id]);
		}
	};

	return (
		<div id={id} style={{ padding: props.space }}>
			<Typography
				onClick={handleClick}
				style={{ color: "#ff596a", fontWeight: "bolder" }}
				id="range-slider"
				align="center"
			>
				{props.label}
			</Typography>
			<CustomSlider
				disabled={!order.includes(id)}
				min={props.min}
				max={props.max}
				value={filter}
				onChange={handleChange}
				valueLabelDisplay="auto"
				aria-labelledby="range-slider"
				// getAriaValueText={valuetext}
			/>
		</div>
	);
};

FilterBarComponent.defaultProps = {
	min: 0,
	max: 100,
};

export default FilterBarComponent;
