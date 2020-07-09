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

const MainContentComponent = () => {
    const classes = useStyles();

    return (
		<Column className={classes.container}>
			<Row vertical="center" horizontal="center">
				<FilterBarComponent label={'Age'} value={[18, 27]} min={18} space={'0px 20px 0px 0px'}></FilterBarComponent>
				<FilterBarComponent label={'Location (KM)'} value={[0, 20]} space={'0px 0px 0px 0px'}></FilterBarComponent>
			</Row>
			<Row vertical="center" horizontal="center">
				<FilterBarComponent label={'Fame Rating'} value={[60, 100]} space={'0px 20px 0px 0px'}></FilterBarComponent>
				<TagBarComponent label={'Tags'}></TagBarComponent>
			</Row>
            <ProfileCardComponent></ProfileCardComponent>
        </Column>
      );
};

export default MainContentComponent;