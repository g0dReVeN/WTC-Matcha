import React from "react";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
	root: {
		width: "100%",
		backgroundColor: theme.palette.background.paper,
	},
	inline: {
		display: "inline",
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

	const [busy, setBusy] = React.useState(true);

	const [profiles, setProfiles] = React.useState([]);

	React.useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_API_URL}/user/history`, {
				headers: {
					Authorization: localStorage.access_token,
				},
			})
			.then((res) => {
				setProfiles([...res.data.users]);
				setBusy(false);
			})
			.catch((err) => {
				console.log(err.response ? err.response.data.msg : err.message);
			});
	}, []);

	const handleView = (profile) => {
		console.log(profile);
	};

	const listItems = busy ? (
		<li key={Number(0).toString() + "_spinner"}>
			<CircularProgress className={classes.spinner} />
		</li>
	) : (
		profiles.map((profile) => (
			<ListItem
				key={profile.username}
				onClick={() => handleView(profile)}
				alignItems="flex-start"
				divider
			>
				<ListItemAvatar>
					<Avatar alt={profile.username} src={profile.image} />
				</ListItemAvatar>
				<ListItemText secondary={<Typography>{profile.username}</Typography>} />
			</ListItem>
		))
	);

	return <List className={classes.root}>{listItems}</List>;
};
