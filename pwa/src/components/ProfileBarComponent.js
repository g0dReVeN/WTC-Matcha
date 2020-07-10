import React from "react";
import axios from "axios";
import { Row } from "simple-flexbox";
import { makeStyles } from "@material-ui/core/styles";
import { Link, useHistory } from "react-router-dom";

const useStyles = makeStyles({
	container: {
		// marginLeft: 32,
		// marginRight: 32,
		height: 70,
		backgroundColor: "#ff596a",
		position: "relavtive",
	},
	proPic: {
		left: 10,
		position: "absolute",
		backgroundColor: "#FFF",
		// border: '1px solid #FFF',
		border: "5px double #ff596a",
		borderRadius: "50%",
		height: 40,
		width: 40,
		cursor: "pointer",
	},
	title: {
		left: 70,
		position: "absolute",
		fontFamily: "Arial",
		fontStyle: "normal",
		fontSize: 19,
		fontWeight: "bold",
		lineHeight: "24px",
		letterSpacing: "0.4px",
		color: "#FFF",
		cursor: "pointer",
	},
	fameR: {
		right: 60,
		position: "absolute",
		backgroundColor: "#FFF",
		// textAlign: 'center',
		// textAlign: 'center',
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: "#ff596a",
		fontWeight: "bold",
		// lineHeight: 2.2,
		// borderBottom: '32px solid #f5f7fa',
		// borderLeft: '8px solid transparent',
		// borderRight: '8px solid transparent',
		// height: 0,
		// width: 32,
		height: 40,
		width: 40,
		border: "5px double #ff596a",
		borderRadius: "50%",
		// ':hover': {
		//     borderBottom: '32px solid #FFF',
		// },
		// cursor: 'pointer',
	},
	logoutB: {
		position: "absolute",
		left: 300,
		height: 40,
		width: 40,
		// borderRadius: '50%',
		// cursor: 'pointer',
	},
	logout: {
		// ':hover': {
		//     fill: '#000',
		// },
		borderRadius: "50%",
		cursor: "pointer",
	},
});

export default function ProfileBarComponent(props) {
	const classes = useStyles();
	const history = useHistory();

	const { openProfile } = props;

	const [pic, setPic] = React.useState(null);

	React.useEffect(() => {
		const fetchPic = async () => {
			try {
				const res = await axios.get(
					`${process.env.REACT_APP_API_URL}/user/downloads/${props.images[0]}`,
					{
						responseType: "blob",
						headers: {
							Authorization: localStorage.access_token,
						},
					}
				);

				setPic(URL.createObjectURL(new File([res.data], `pic.png`)));
			} catch (err) {
				console.log(err.response ? err.response.data.msg : err.message);
			}
		};

		fetchPic();
	}, [setPic, props.images]);

	const logOut = () => {
		localStorage.removeItem("access_token");
		history.push("/login");
	};

	const handleShowProfileModal = () => {
		openProfile();
	};

	return (
		<Row className={classes.container} horizontal="start" vertical="center">
			<img
				className={classes.proPic}
				src={pic}
				alt=""
				onClick={handleShowProfileModal}
			></img>
			<div className={classes.title} onClick={handleShowProfileModal}>
				{props.username}
			</div>
			<div className={classes.fameR}>{props.fame_rating}</div>
			<Link className={classes.logoutB} to="/login">
				<img
					className={classes.logout}
					src="/assets/logout.svg"
					alt="Logout"
					onClick={logOut}
				></img>
			</Link>
		</Row>
	);
}

ProfileBarComponent.defaultProps = {
	username: "My Profile",
	fame_rating: 100,
};
