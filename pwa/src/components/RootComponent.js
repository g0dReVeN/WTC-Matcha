import React from 'react';
import { Column, Row } from 'simple-flexbox';
import { makeStyles } from '@material-ui/core/styles'
import SideBarComponent from './SideBarComponent';
import HeaderComponent from './HeaderComponent';
import FooterComponent from './FooterComponent';
import MainContentComponent from './MainContentComponent';

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
    }
});

export default (props) => {
	const classes = useStyles();
	
	return (
		<Row className={ classes.container }>
			<SideBarComponent userInfo={ props.fetchInitialData() } />
			<Column className={ classes.mainBlock } vertical="flex-start" horizontal="center">
				<HeaderComponent />
				<MainContentComponent />
				<FooterComponent />
			</Column>
		</Row>
					
	);
};