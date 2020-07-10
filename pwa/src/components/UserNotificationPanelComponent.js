import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import NotificationsActiveIcon from "@material-ui/icons/NotificationsActive";

const useStyles = makeStyles((theme) => ({
	root: {
		width: 350,
		"& .MuiToggleButton-root": {
			"&:focused": {
				backgroundColor: "rgba(255, 89, 106, 0.3)",
				color: "black",
			},
			"&:hover": {
				backgroundColor: "rgba(255, 89, 106, 0.5)",
				color: "black",
			},
			"&.Mui-selected": {
				backgroundColor: "rgba(255, 89, 106, 0.3)",
				color: "black",
			},
		},
	},
	btn: {
		borderRadius: 0,
		fontWeight: "bold",
		fontSize: 13,
		color: "black",
		// padding: "6px 12px",
		// border: '1px solid',
		// borderColor: '#007bff',
		// fontFamily: [
		// 	"-apple-system",
		// 	"BlinkMacSystemFont",
		// 	'"Segoe UI"',
		// 	"Roboto",
		// 	'"Helvetica Neue"',
		// 	"Arial",
		// 	"sans-serif",
		// 	'"Apple Color Emoji"',
		// 	'"Segoe UI Emoji"',
		// 	'"Segoe UI Symbol"',
		// ].join(","),
		// "&:focus": {
		// 	backgroundColor: "rgba(255, 89, 106, 0.3)",
		// },
		// "&:hover": {
		// 	backgroundColor: "#ff596a",
		// },
		flex: 1,
	},
	icon: {
		// color: "#ff596a",
		color: "red",
		fontSize: "16px",
	},
}));

const UserNotificationPanelComponent = ({
	tab,
	setTab,
	messageBell,
	notificationBell,
}) => {
	const classes = useStyles();

	const handleTab = (event, newTab) => {
		if (newTab !== null) {
			setTab(newTab);
		} else {
			setTab(tab);
		}
	};

	return (
		<ToggleButtonGroup
			className={classes.root}
			value={tab}
			exclusive
			onChange={handleTab}
		>
			<ToggleButton className={classes.btn} value="history">
				{"History"}
			</ToggleButton>
			<ToggleButton className={classes.btn} value="messages">
				{messageBell ? (
					<NotificationsActiveIcon className={classes.icon} />
				) : (
					""
				)}
				{"Messages"}
			</ToggleButton>
			<ToggleButton className={classes.btn} value="notifications">
				{notificationBell ? (
					<NotificationsActiveIcon className={classes.icon} />
				) : (
					""
				)}
				{"Notifications"}
			</ToggleButton>
		</ToggleButtonGroup>
	);
};

UserNotificationPanelComponent.defaultProps = {
	tab: "history",
	messageBell: true,
	notificationBell: true,
};

export default UserNotificationPanelComponent;
