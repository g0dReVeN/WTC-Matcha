import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
	root: {
		width: "100%",
		maxWidth: "36ch",
		backgroundColor: theme.palette.background.paper,
		paddingTop: 0,
	},
	inline: {
		// display: "inline",
		color: "black",
		fontWeight: 700,
	},
	spinner: {
		// position: "absolute",
		// top: 0,
		// right: "8px",
		width: "60px",
		height: "60px",
		// padding: "",
		color: "#ff596a",
	},
}));

export default (props) => {
	const classes = useStyles();

	const profiles = [];

	const handleChat = (profile) => {
		console.log(profile);
	};

	// const listItems = profiles.map((profile) => {
	// 	<li key={profile.id} onClick={() => handleChat(profile)}>
	// 		<ListItem alignItems="flex-start">
	// 			<ListItemAvatar>
	// 				<Avatar
	// 					alt={`${profile.firstname} ${profile.surname}`}
	// 					src={profile.images[0]}
	// 				/>
	// 			</ListItemAvatar>
	// 			<ListItemText
	// 				primary={`${profile.firstname} ${profile.surname}`}
	// 				secondary={
	// 					profile.lastSender === "me"
	// 						? `You - ${profile.lastMessage}`
	// 						: `- ${profile.lastMessage}`
	// 				}
	// 			/>
	// 		</ListItem>
	// 		<Divider variant="inset" component="li" />
	// 	</li>;
	// });

	// return <List className={classes.root}>{listItems}</List>;
	return (
		<List className={classes.root}>
			<ListItem alignItems="flex-start">
				<ListItemAvatar>
					<Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
				</ListItemAvatar>
				<ListItemText
					primary="Remy Sharp"
					secondary={"I'll be in your neighborhood doing errands this…"}
				/>
			</ListItem>
			<Divider variant="inset" component="li" />
			<ListItem alignItems="flex-start">
				<ListItemAvatar>
					<Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
				</ListItemAvatar>
				<ListItemText
					// primary="You - Wish I could come, but I'm out of town this…"
					secondary={<Typography>"Travis Howard"</Typography>}
				/>
			</ListItem>
			<Divider variant="inset" component="li" />
			<ListItem alignItems="flex-start">
				<ListItemAvatar>
					<Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
				</ListItemAvatar>
				<ListItemText
					primary="Oui Oui"
					secondary={
						<React.Fragment>
							<Typography
								component="span"
								variant="body2"
								className={classes.inline}
								color="textPrimary"
							>
								Sandra Adams
							</Typography>
							{" — Do you have Paris recommendations? Have you ever…"}
						</React.Fragment>
					}
				/>
			</ListItem>
		</List>
	);
};
