import React from "react";
import CreatableSelect from "react-select/creatable";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
	root: {
		width: 200,
		paddingBottom: 10,
	},
});

const scaryAnimals = [
	{ label: "Alligators", value: 1 },
	{ label: "Crocodiles", value: 2 },
	{ label: "Sharks", value: 3 },
	{ label: "Small crocodiles", value: 4 },
	{ label: "Smallest crocodiles", value: 5 },
	{ label: "Snakes", value: 6 },
];

const TagBarComponent = (props) => {
	const classes = useStyles();

	const { filter, setFilter, order, setOrder, id } = props;

	const handleChange = (newValue, actionMeta) => {
		// console.group("Value Changed");
		// console.log(newValue);
		// console.log(`action: ${actionMeta.action}`);
		// console.groupEnd();
		// // this.setState({ value });

		setFilter(
			id,
			newValue
				? newValue.map((tag) => {
						return tag.label;
				  })
				: []
		);
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

	const createOption = (label) => ({
		label,
		value: label,
	});

	const colorStyles = {
		// container: (styles, state) => ({
		//     ...styles,
		//     backgroundColor: '#FFF',
		//     // border: '2px solid #ff596a',
		//     border: state.isSelected && '2px solid black',
		//     // color: state.isSelected ? 'white' : 'black',
		// }),
		control: (styles, state) => ({
			...styles,
			backgroundColor: "#FFF",
			border: `2px solid ${order.includes(id) ? "#ff596a" : "hsl(0,0%,80%)"}`,
		}),
		multiValue: (styles) => {
			return {
				...styles,
				backgroundColor: "rgba(254,88,107,0.10)",
			};
		},
		multiValueLabel: (styles) => ({
			...styles,
			color: "#ff596a",
		}),
		multiValueRemove: (styles) => ({
			...styles,
			color: "#ff596a",
			":hover": {
				backgroundColor: "#ff596a",
				color: "white",
			},
		}),
		clearIndicator: (styles) => ({
			...styles,
			color: order.includes(id) ? "#ff596a" : "hsl(0,0%,80%)",
		}),
		dropdownIndicator: (styles) => ({
			...styles,
			color: order.includes(id) ? "#ff596a" : "hsl(0,0%,80%)",
		}),
		placeholder: (styles) => ({
			...styles,
			color: order.includes(id) ? "#ff596a" : "hsl(0,0%,80%)",
		}),
	};

	return (
		<div id={id} className={classes.root}>
			<div className="container">
				<Typography
					onClick={handleClick}
					style={{ color: "#ff596a", fontWeight: "bolder" }}
					align="center"
				>
					{props.label}
				</Typography>
				<CreatableSelect
					isDisabled={!order.includes(id)}
					isMulti
					styles={colorStyles}
					options={scaryAnimals}
					value={filter.map((tag) => createOption(tag))}
					onChange={handleChange}
				/>
			</div>
		</div>
	);
};

export default TagBarComponent;
