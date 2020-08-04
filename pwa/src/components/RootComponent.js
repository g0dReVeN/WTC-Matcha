import React from "react";
import axios from "axios";
import io from "socket.io-client";
import { Column, Row } from "simple-flexbox";
import { makeStyles } from "@material-ui/core/styles";
import SideBarComponent from "./SideBarComponent";
import HeaderComponent from "./HeaderComponent";
import FooterComponent from "./FooterComponent";
import MainContentComponent from "./MainContentComponent";
import ProfileDetailsModal from "./ProfileDetailsModal";
import { SocketContext, socket } from "../contexts/socket";

const useStyles = makeStyles({
	container: {
		height: "100%",
		minHeight: "100vh",
	},
	mainBlock: {
		backgroundColor: "#FFF",
		backgroundImage:
			'linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.0)), url("/assets/background4.jpg")',
		width: "100%",
		position: "relative",
	},
});

export default (props) => {
	const classes = useStyles();

	const [state, setState] = React.useState({
		userInfo: props.fetchInitialData(),
		title: "PROFILE DETAILS",
		open: false,
	});

	// const handleOpen = React.useCallback(() => {
	// 	setState({ ...state, open: !state.open });
	// }, [])

	const handleOpen = () => {
		setState({ ...state, open: !state.open });
	};

	const handleClose = () => {
		setState({
			...state,
			open: !state.open,
			userInfo: props.fetchInitialData(),
		});
	};

	React.useEffect(() => {
		if (!state.userInfo.completed_profile) {
			handleOpen();
		}
	}, [state.userInfo.completed_profile]);

	return (
		<Row className={classes.container}>
			<SocketContext.Provider value={socket}>
				<SideBarComponent userInfo={state.userInfo} openProfile={handleOpen} />
				<Column
					className={classes.mainBlock}
					vertical="flex-start"
					horizontal="center"
				>
					<HeaderComponent />
					<MainContentComponent userInfo={state.userInfo} />
					<FooterComponent />
				</Column>
				<ProfileDetailsModal
					userInfo={state.userInfo}
					title={state.title || "PROFILE DETAILS"}
					open={state.open}
					onClose={handleClose}
				/>
			</SocketContext.Provider>
		</Row>
	);
};
