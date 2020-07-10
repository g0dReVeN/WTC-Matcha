import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import { Profiler } from "react";

const useStyles = makeStyles((theme) => ({
	root: {
		width: "100%",
		maxWidth: "36ch",
		backgroundColor: theme.palette.background.paper,
	},
	inline: {
		// display: "inline",
		color: "black",
		fontWeight: 700,
	},
}));

export default ({ profiles }) => {
	const classes = useStyles();

	const handleView = (profile) => {
		console.log(profile);
	};

	const actionContext = (profile) => {
		return profile.action === "like"
			? " - has liked your profile"
			: profile.action === "unlike"
			? " - has unliked your profile"
			: profile.action === "consult"
			? " - has consulted your profile"
			: profile.action === "likes"
			? " - likes your profile as well"
			: "";
	};

	console.log(profiles);
	const listItems = profiles.reduce((acc, profile) => {
		if (!!profile) {
			return [
				...acc,
				<ListItem
					key={profile.user_id}
					onClick={() => handleView(profile)}
					alignItems="flex-start"
					divider
				>
					<ListItemAvatar>
						<Avatar alt={profile.username} src={profile.image} />
					</ListItemAvatar>
					<ListItemText
						primary={profile.username}
						secondary={
							<React.Fragment>
								<Typography
									component="span"
									variant="body2"
									className={profile.read ? classes.inline : ""}
									color="textPrimary"
								>
									{actionContext(profile)}
								</Typography>
							</React.Fragment>
						}
					/>
				</ListItem>,
			];
		}

		return acc;
	}, []);

	return <List className={classes.root}>{listItems}</List>;
};
