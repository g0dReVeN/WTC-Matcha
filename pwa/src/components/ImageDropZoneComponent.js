import React from "react";
import { Column, Row } from "simple-flexbox";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles((theme) => ({
	root: {
		display: "flex",
		"& > *": {
			margin: theme.spacing(1),
			width: theme.spacing(25),
			height: theme.spacing(35),
		},
	},
	paper: {
		border: "1px dashed #BEBEBE",
        borderRadius: "15px",
		position: 'relative',
		backgroundColor: "#F0F0F0",
	},
	img: {
		width: "200px",
		height: "280px",
		borderRadius: "15px",
    },
    icon: {
        position: 'absolute',
        top: 0,
        right: "8px",
        color: "#000",
    }
}));

export default (props) => {
	const classes = useStyles();

	const { file, setFile, id} = props;
	// const id = 'image1';
	// const [file, setFile] = React.useState(null);

	const handleChange = value => event => {
		setFile(value, URL.createObjectURL(event.target.files[0]));
    };
    
    const handleRemove = value => event => {
		setFile(value, 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
	};

	const handleClick = (event) => {
		document.getElementById(id).click();
	};

	return (
		<Column className={classes.root}>
			<Paper className={classes.paper}>
				<input
					id={id}
					type={"file"}
					accept={".jpg, .jpeg, .png"}
					style={{ display: "none" }}
					onChange={handleChange(id)}
				/>
				<img className={classes.img} src={file} onClick={handleClick} />
				<IconButton
					aria-label="close modal"
					edge="end"
                    className={classes.icon}
                    onClick={handleRemove(id)}
				>
					<CloseIcon />
				</IconButton>
			</Paper>
		</Column>
	);
};
