import React from 'react';
import { Row, Column } from 'simple-flexbox';
import { makeStyles } from '@material-ui/core/styles';
import ProfileCardComponent from './ProfileCardComponent';
import FilterBarComponent from './FilterBarComponent';
import TagBarComponent from './TagBarComponent';

const useStyles = makeStyles(theme => ({
    container: {
	  marginBottom: 50,
    },
}));

export default (props) => {
    const classes = useStyles();

	const [filters, setFilters] = React.useState({
		age: [18, 27],
		distance: 10000,
		fame_rating: [60, 100],
		// tags: props.userInfo.tags,
		tags: [],
	});

	const [order, setOrder] = React.useState([]);

	console.log(order)
	const handleFilterState = (key, value) => {
		setFilters({ ...filters, [key]: value });
	};
	// console.log(filters);
    return (
		<Column className={classes.container}>
			<Row vertical="center" horizontal="center">
				<FilterBarComponent label={'Age'} filter={filters.age} setFilter={handleFilterState} order={order} setOrder={setOrder} id={'age'} min={18} space={'0px 20px 0px 0px'}></FilterBarComponent>
				<FilterBarComponent label={'Distance (KM)'} filter={filters.distance} setFilter={handleFilterState} order={order} setOrder={setOrder} id={'distance'} max={10000} space={'0px 0px 0px 0px'}></FilterBarComponent>
			</Row>
			<Row vertical="center" horizontal="center">
				<FilterBarComponent label={'Fame Rating'} filter={filters.fame_rating} setFilter={handleFilterState} order={order} setOrder={setOrder} id={'fame_rating'} space={'0px 20px 0px 0px'}></FilterBarComponent>
				<TagBarComponent label={'Tags'} filter={filters.tags} setFilter={handleFilterState} order={order} setOrder={setOrder} id={'tags'}></TagBarComponent>
			</Row>
            <ProfileCardComponent filters={filters} order={order} ></ProfileCardComponent>
        </Column>
      );
};