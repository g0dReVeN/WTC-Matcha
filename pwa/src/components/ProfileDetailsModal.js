import React from "react";
import ReactDOM from "react-dom";
import { Column, Row } from "simple-flexbox";
import { Link, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
// import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputAdornment from "@material-ui/core/InputAdornment";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import TagBarComponent from "./TagBarComponent";
import ImageDropZoneComponent from "./ImageDropZoneComponent";

import Autocomplete from "@material-ui/lab/Autocomplete";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import Grid from "@material-ui/core/Grid";
import parse from "autosuggest-highlight/parse";
import throttle from "lodash/throttle";

// import GooglePlacesAutocomplete from "react-google-places-autocomplete";
// If you want to use the provided css
// import "react-google-places-autocomplete/dist/index.min.css";

const autocompleteService = { current: null };

const useStyles = makeStyles({
	icon: {
		color: theme.palette.text.secondary,
		marginRight: theme.spacing(2),
	},
	container: {
		height: "100%",
		minHeight: "100vh",
	},
	mainBlock: {
		backgroundColor: "rgba(255,89,106, 0.9)",
		backgroundImage:
			'linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.0)), url("/assets/background4.jpg")',
		width: "100%",
		minHeight: "100vh",
		position: "relative",
	},
	title: {
		color: "#FFF",
		paddingTop: 0,
		textAlign: "center",
		"& h2": {
			fontSize: "2.5rem",
		},
	},
	root: {
		width: "100%",
		color: "#ff596a",
		"& label": {
			color: "#ff596a",
			"&.Mui-focused": {
				color: "#ff596a",
			},
		},
		"& .MuiOutlinedInput-root": {
			"& fieldset": {
				borderColor: "#ff596a",
			},
			"&:hover fieldset": {
				border: "5px solid #ff596a",
			},
			"&.Mui-focused fieldset": {
				border: "5px solid #ff596a",
			},
		},
	},
	form: {
		marginTop: 70,
	},
	field: {
		width: 300,
		margin: "35px 0px 0px 0px",
		backgroundColor: "#FFF",
		color: "#ff596a",
	},
	field2: {
		width: 300,
		margin: "0px",
		backgroundColor: "#FFF",
		color: "#ff596a",
	},
	btn: {
		width: 300,
		textAlign: "center",
		fontSize: 18,
		fontWeight: "bold",
		margin: "20px 0px 0px 0px",
		color: "#FFF",
		backgroundColor: "#ff596a",
		"&:hover": {
			backgroundColor: "rgba(255,89,106, 0.9) ",
		},
	},
	text: {
		color: "#ff596a",
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
		fontWeight: "400",
		textDecorationLine: "none",
		fontSize: "0.875rem",
		lineHeight: "1.43",
		letterSpacing: "0.01071em",
		"&:hover": {
			textDecorationLine: "underline",
		},
	},
	msg: {
		width: 300,
		// height: 80,
		fontSize: 16,
		// backgroundColor: 'white',
		// wordWrap: 'break-word',
		// color: values.color,
	},
});

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const genders = [
	{
		value: 0,
		label: "Male",
	},
	{
		value: 1,
		label: "Female",
	},
	{
		value: 2,
		label: "Nonbinary",
	},
];

const sexPrefs = [
	{
		value: 0,
		label: "Hetero",
	},
	{
		value: 1,
		label: "Homo",
	},
	{
		value: 2,
		label: "Bi",
	},
];

export default (props) => {
	const classes = useStyles();

	const { title, open, onClose } = props;

	const [values, setValues] = React.useState({
		username: "",
		firstname: "",
		lastname: "",
		email: "",
		gender: 0,
		sexPref: 0,
		bio: "",
		password: "",
		showPassword: false,
		resMsg: "",
		color: "red",
	});

	const defaultFile =
		"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
	const [files, setFiles] = React.useState({
		image1: defaultFile,
		image2: defaultFile,
		image3: defaultFile,
		image4: defaultFile,
		image5: defaultFile,
	});

	const [val, setVal] = React.useState(null);
	const [inputValue, setInputValue] = React.useState("");
	const [options, setOptions] = React.useState([]);
	const loaded = React.useRef(false);

	const fetch = React.useMemo(
		() =>
			throttle((request, callback) => {
				autocompleteService.current.getPlacePredictions(request, callback);
			}, 200),
		[]
	);

	React.useEffect(() => {
		let active = true;

		if (!autocompleteService.current && window.google) {
			autocompleteService.current = new window.google.maps.places.AutocompleteService();
		}
		if (!autocompleteService.current) {
			return undefined;
		}

		if (inputValue === "") {
			setOptions(val ? [val] : []);
			return undefined;
		}

		fetch({ input: inputValue }, (results) => {
			if (active) {
				let newOptions = [];

				if (val) {
					newOptions = [val];
				}

				if (results) {
					newOptions = [...newOptions, ...results];
				}

				setOptions(newOptions);
			}
		});

		return () => {
			active = false;
		};
	}, [val, inputValue, fetch]);

	const handleFileState = (key, value) => {
		setFiles({ ...files, [key]: value });
	};

	const handleChange = (value) => (event) => {
		setValues({ ...values, [value]: event.target.value });
	};

	const handleClose = () => {
		onClose();
	};

	const handleMouseDownPassword = (event) => {
		event.preventDefault();
	};

	const descriptionElementRef = React.useRef(null);
	React.useEffect(() => {
		if (open) {
			const { current: descriptionElement } = descriptionElementRef;
			if (descriptionElement !== null) {
				descriptionElement.focus();
			}
		}
	}, [open]);

	const loginUser = (event) => {
		event.preventDefault();

		const userInfo = {
			username: values.username,
			password: values.password,
		};

		// axios.post(process.env.REACT_APP_API_URL + '/login', userInfo)
		//     .then(res => {
		//         if (res.status === 200) {
		//             localStorage.clear();
		//             localStorage.access_token = res.data.token;
		//             history.push("/");
		//         }
		//     }).catch(err => {
		//         console.log(err);
		//         setValues({ resMsg: err.response.data.msg });
		//     });
	};

	return (
		<Dialog
			fullScreen
			open={open}
			scroll={"paper"}
			onClose={handleClose}
			TransitionComponent={Transition}
			paperprops={{
				style: {
					backgroundColor: "rgba(255,89,106, 0.9)",
					// backgroundImage:
					// 'linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.0)), url("/assets/background4.jpg")',
				},
			}}
		>
			<DialogActions>
				<IconButton
					aria-label="close modal"
					onClick={handleClose}
					edge="end"
					style={{ color: "#FFF" }}
				>
					<CloseIcon />
				</IconButton>
			</DialogActions>

			<DialogTitle
				className={classes.title}
				PaperProps={{
					style: {
						fontSize: "24px",
					},
				}}
				id="dialog-title"
			>
				{props.title}
			</DialogTitle>
			<DialogContent>
				<Column className={classes.root} vertical="center" horizontal="center">
					<form className={classes.form} noValidate autoComplete="off">
						<Column vertical="center" horizontal="center">
							<Typography
								className={classes.msg}
								style={{ color: values.color }}
							>
								{values.resMsg}
							</Typography>
							<TextField
								required
								className={classes.field2}
								label="Email"
								variant="outlined"
								value={values.email || ""}
								onChange={handleChange("email")}
							/>
							<TextField
								required
								className={classes.field}
								label="Surname"
								variant="outlined"
								value={values.lastname || ""}
								onChange={handleChange("lastname")}
							/>
							<TextField
								required
								className={classes.field}
								label="First Name"
								variant="outlined"
								value={values.firstname || ""}
								onChange={handleChange("firstname")}
							/>
							<TextField
								required
								select
								className={classes.field}
								label="Gender"
								value={values.gender}
								onChange={handleChange("gender")}
								variant="outlined"
							>
								{genders.map((gender) => (
									<MenuItem key={gender.value} value={gender.value}>
										{gender.label}
									</MenuItem>
								))}
							</TextField>
							<TextField
								required
								select
								className={classes.field}
								label="Sexual Preference"
								value={values.sexPref}
								onChange={handleChange("sexPref")}
								variant="outlined"
							>
								{sexPrefs.map((sexPref) => (
									<MenuItem key={sexPref.value} value={sexPref.value}>
										{sexPref.label}
									</MenuItem>
								))}
							</TextField>
							<TextField
								required
								multiline
								rows={4}
								className={classes.field}
								label="Bio"
								value={values.bio}
								onChange={handleChange("bio")}
								variant="outlined"
							/>
							<TagBarComponent label={"Tags"}></TagBarComponent>
							<Row>
								<ImageDropZoneComponent
									file={files.image1}
									setFile={handleFileState}
									id={"image1"}
								/>
								{files.image1 != defaultFile ? (
									<ImageDropZoneComponent
										file={files.image2}
										setFile={handleFileState}
										id={"image2"}
									/>
								) : (
									""
								)}
								{files.image2 != defaultFile ? (
									<ImageDropZoneComponent
										file={files.image3}
										setFile={handleFileState}
										id={"image3"}
									/>
								) : (
									""
								)}
								{files.image3 != defaultFile ? (
									<ImageDropZoneComponent
										file={files.image4}
										setFile={handleFileState}
										id={"image4"}
									/>
								) : (
									""
								)}
								{files.image4 != defaultFile ? (
									<ImageDropZoneComponent
										file={files.image5}
										setFile={handleFileState}
										id={"image5"}
									/>
								) : (
									""
								)}
							</Row>
							<Autocomplete
								id="google-map-demo"
								style={{ width: 300 }}
								getOptionLabel={(option) =>
									typeof option === "string" ? option : option.description
								}
								filterOptions={(x) => x}
								options={options}
								autoComplete
								includeInputInList
								filterSelectedOptions
								value={val}
								onChange={(event, newValue) => {
									setOptions(newValue ? [newValue, ...options] : options);
									setVal(newValue);
								}}
								onInputChange={(event, newInputValue) => {
									setInputValue(newInputValue);
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Add a location"
										variant="outlined"
										fullWidth
									/>
								)}
								renderOption={(option) => {
									const matches =
										option.structured_formatting.main_text_matched_substrings;
									const parts = parse(
										option.structured_formatting.main_text,
										matches.map((match) => [
											match.offset,
											match.offset + match.length,
										])
									);

									return (
										<Grid container alignItems="center">
											<Grid item>
												{/* <LocationOnIcon className={classes.icon} /> */}
											</Grid>
											<Grid item xs>
												{parts.map((part, index) => (
													<span
														key={index}
														style={{ fontWeight: part.highlight ? 700 : 400 }}
													>
														{part.text}
													</span>
												))}

												<Typography variant="body2" color="textSecondary">
													{option.structured_formatting.secondary_text}
												</Typography>
											</Grid>
										</Grid>
									);
								}}
							/>
							<Button
								className={classes.field}
								variant="contained"
								onClick={loginUser}
							>
								Register
							</Button>
						</Column>
					</form>
				</Column>
			</DialogContent>
		</Dialog>
	);
};
