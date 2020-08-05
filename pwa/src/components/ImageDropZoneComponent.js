import React from "react";
import { Column } from "simple-flexbox";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
	root: {
		display: "flex",
		margin: theme.spacing(1),
		"& > *": {
			width: theme.spacing(25),
			height: theme.spacing(35),
		},
	},
	paper: {
		margin: "35px 0px 0px 0px",
		border: "1px dashed #ff596a",
		borderRadius: "15px",
		position: "relative",
		backgroundColor: "#F0F0F0",
	},
	img: {
		width: "200px",
		height: "280px",
		borderRadius: "15px",
	},
	icon: {
		position: "absolute",
		top: 0,
		right: "8px",
		color: "#000",
	},
	addIcon: {
		// position: "absolute",
		// top: 0,
		// right: "8px",
		fontSize: "4.5rem",
		padding: "104px 65px 104px 65px",
		color: "#ff596a",
	},
	spinner: {
		// position: "absolute",
		// top: 0,
		// right: "8px",
		width: "60px",
		height: "60px",
		padding: "110px 70px 110px 70px",
		color: "#ff596a",
	},
	closeIcon: {
		color: "#ff596a",
	},
}));

// const defaultBGImage =
// "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export default (props) => {
	const classes = useStyles();

	const { files, setFile, id } = props;

	const handleChange = event => {
		setFile(id, event.target.files[0]);
	};

	const handleRemove = () => {
		setFile(id, null);
	};

	const handleClick = event => {
		document.getElementById(id).click();
	};

	const getImg = image => {
		return URL.createObjectURL(image);
	};

	return (
		<Column className={classes.root}>
			<Paper className={classes.paper}>
				<input
					id={id}
					type={"file"}
					accept={".jpg, .jpeg, .png"}
					style={{ display: "none" }}
					onChange={handleChange}
				/>
				{files[id] ? (
					typeof files[id] == "string" ? (
						<CircularProgress className={classes.spinner} />
					) : (
						<div>
							<img
								key={id}
								className={classes.img}
								src={getImg(files[id])}
								onClick={handleClick}
							/>
							<IconButton
								aria-label="close modal"
								edge="end"
								className={classes.icon}
								onClick={handleRemove}
							>
								<CloseIcon className={classes.closeIcon}/>
							</IconButton>
						</div>
					)
				) : (
					<AddAPhotoIcon className={classes.addIcon} onClick={handleClick} />
				)}
			</Paper>
		</Column>
	);
};
