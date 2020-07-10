import React from "react";
import axios from "axios";
import { Column, Row } from "simple-flexbox";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputAdornment from "@material-ui/core/InputAdornment";
import FormControl from "@material-ui/core/FormControl";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import CircularProgress from "@material-ui/core/CircularProgress";
import parse from "autosuggest-highlight/parse";
import throttle from "lodash/throttle";
import ImageDropZoneComponent from "./ImageDropZoneComponent";
import genders from "../enums/genders";
import sexPrefs from "../enums/sexPrefs";
import tags from "../enums/tags";

const useStyles = makeStyles({
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
		color: "#ff596a",
		paddingTop: 0,
		textAlign: "center",
		"& h2": {
			fontSize: "3rem",
			fontWeight: 700,
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
	// form: {
	// 	marginTop: 70,
	// },
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
		margin: "35px 0px 35px 0px",
		color: "#FFF",
		backgroundColor: "#ff596a",
		"&:hover": {
			backgroundColor: "rgba(255,89,106, 0.9) ",
		},
	},
	closeBtn: {
		color: "#ff596a",
		width: "50px",
		height: "50px",
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
	spinner: {
		color: "#FFF",
	},
	dialog: {
		backgroundColor: "rgba(255,89,106, 0.9)",
		backgroundImage:
			'linear-gradient(rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.0)), url("/assets/background4.jpg")',
	},
});

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

let geocoder = null;
const autocompleteService = { current: null };

export default (props) => {
	const classes = useStyles();

	const { title, open, onClose, userInfo } = props;

	const [state, setState] = React.useState({
		isBusy: false,
		showPassword: false,
		resMsg: "",
		color: "red",
	});

	const [values, setValues] = React.useState({
		firstname: userInfo.firstname ? userInfo.firstname : "",
		lastname: userInfo.lastname ? userInfo.lastname : "",
		email: userInfo.email ? userInfo.email : "",
		age: userInfo.age ? userInfo.age : "",
		gender: userInfo.gender,
		sexual_preference: userInfo.sexual_preference,
		biography: userInfo.biography ? userInfo.biography : "",
		tags: userInfo.tags ? userInfo.tags : [],
		password: "",
	});

	const [files, setFiles] = React.useState({
		image0: userInfo.images ? userInfo.images[0] : null,
		image1: userInfo.images ? userInfo.images[1] : null,
		image2: userInfo.images ? userInfo.images[2] : null,
		image3: userInfo.images ? userInfo.images[3] : null,
		image4: userInfo.images ? userInfo.images[4] : null,
	});

	const [place, setPlace] = React.useState(null);
	const [inputValue, setInputValue] = React.useState("");
	const [options, setOptions] = React.useState([]);

	React.useEffect(() => {
		const fetchImages = async () => {
			if (userInfo.images) {
				const promises = userInfo.images.map((image) => {
					try {
						return axios
							.get(`${process.env.REACT_APP_API_URL}/user/downloads/${image}`, {
								responseType: "blob",
								headers: {
									Authorization: localStorage.access_token,
								},
							})
							.catch((err) => {
								console.log(err.response ? err.response.data.msg : err.message);
							});
					} catch (err) {
						console.log(err.response ? err.response.data.msg : err.message);
						return null;
					}
				});

				const downloadedBlobs = await Promise.all(promises);

				setFiles({
					[`image0`]: downloadedBlobs[0]
						? new File([downloadedBlobs[0].data], `image0.png`)
						: null,
					[`image1`]: downloadedBlobs[1]
						? new File([downloadedBlobs[1].data], `image1.png`)
						: null,
					[`image2`]: downloadedBlobs[2]
						? new File([downloadedBlobs[2].data], `image2.png`)
						: null,
					[`image3`]: downloadedBlobs[3]
						? new File([downloadedBlobs[3].data], `image3.png`)
						: null,
					[`image4`]: downloadedBlobs[4]
						? new File([downloadedBlobs[4].data], `image4.png`)
						: null,
				});
			}
		};

		if (userInfo.images && userInfo.images.length) fetchImages();
	}, []);

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
			setOptions(place ? [place] : []);
			return undefined;
		}

		fetch({ input: inputValue }, (results) => {
			if (active) {
				let newOptions = [];

				if (place) {
					newOptions = [place];
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
	}, [place, inputValue, fetch]);

	const handlePlaceChange = (place) => {
		setPlace(place);
	};

	const handleFileState = (key, value) => {
		setFiles({ ...files, [key]: value });
	};

	const handleChange = (value) => (event) => {
		setValues({ ...values, [value]: event.target.value });
	};

	const handleClose = () => {
		if (!state.isBusy) {
			setState({ ...state, resMsg: "" });
			onClose();
		}
	};

	const handleClickShowPassword = () => {
		setState({ ...state, showPassword: !state.showPassword });
	};

	const handleMouseDownPassword = (event) => {
		event.preventDefault();
	};

	const getLatLgnGoogle = (placeId) => {
		return new Promise((resolve, reject) => {
			if (!geocoder) geocoder = new window.google.maps.Geocoder();

			geocoder.geocode({ placeId }, (results, status) => {
				if (status === "OK") {
					resolve(results[0].geometry.location);
				} else {
					reject(status);
				}
			});
		});
	};

	const updateProfile = async (event) => {
		event.preventDefault();
		setState({ isBusy: true });

		const data = new FormData();

		// await new Promise((res) => setTimeout(res, 100000));

		if (place && place.place_id) {
			const res = await getLatLgnGoogle(place.place_id);

			data.append("lat", Number(res.lat()));
			data.append("long", Number(res.lng()));
		} else {
			try {
				const res = await axios.post(
					`https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}`
				);

				data.append("lat", Number(res.data.location.lat));
				data.append("long", Number(res.data.location.lng));
			} catch (error) {
				console.error(error);
			}
		}

		Object.keys(values).forEach((key) => {
			if (key === "tags" && values[key]) {
				values.tags.map((tag) => {
					data.append("tags[]", tag);
				});
			} else {
				data.append(key, values[key]);
			}
		});

		Object.values(files).forEach((file) => {
			data.append("files", file);
		});

		try {
			const res = await axios.patch(
				process.env.REACT_APP_API_URL + "/user/editProfile",
				data,
				{
					headers: {
						Authorization: localStorage.access_token,
						"Content-Type": "multipart/form-data",
					},
				}
			);

			localStorage.clear();
			localStorage.access_token = res.data.token;
			setState({ isBusy: false, color: "green", resMsg: res.data.msg });
		} catch (err) {
			setState({
				isBusy: false,
				color: "red",
				resMsg: err.response ? err.response.data.msg : err.message,
			});
		}
	};

	return (
		<Dialog
			fullScreen
			open={open}
			scroll={"paper"}
			onClose={handleClose}
			TransitionComponent={Transition}
			classes={{ paper: classes.dialog }}
		>
			<DialogActions>
				<IconButton aria-label="close modal" onClick={handleClose} edge="end">
					<CloseIcon className={classes.closeBtn} />
				</IconButton>
			</DialogActions>

			<DialogTitle className={classes.title} id="title">
				{title}
			</DialogTitle>
			<DialogContent>
				<Column className={classes.root} vertical="center" horizontal="center">
					<form className={classes.form} noValidate autoComplete="off">
						<Column vertical="center" horizontal="center">
							<Typography
								className={classes.msg}
								style={{ color: state.color }}
							>
								{state.resMsg}
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
								className={classes.field}
								label="Age"
								variant="outlined"
								value={values.age || ""}
								onChange={handleChange("age")}
							/>
							<TextField
								required
								select
								className={classes.field}
								label="Gender"
								value={values.gender || 0}
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
								value={values.sexual_preference}
								onChange={handleChange("sexual_preference")}
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
								value={values.biography}
								onChange={handleChange("biography")}
								variant="outlined"
							/>
							<Autocomplete
								multiple
								id="tags"
								options={tags.map((option) => option.title)}
								value={values.tags || []}
								onChange={(event, updatedTags) => {
									setValues({ ...values, tags: updatedTags });
								}}
								freeSolo
								renderTags={(value, getTagProps) =>
									value.map((option, index) => (
										<Chip
											variant="outlined"
											label={option}
											{...getTagProps({ index })}
										/>
									))
								}
								renderInput={(params) => (
									<TextField
										{...params}
										className={classes.field}
										variant="outlined"
										label="Tags"
									/>
								)}
							/>
							<Autocomplete
								id="place"
								style={{ width: 300 }}
								getOptionLabel={(option) =>
									typeof option === "string" ? option : option.description
								}
								filterOptions={(x) => x}
								options={options}
								autoComplete
								includeInputInList
								filterSelectedOptions
								value={place}
								onChange={(event, place) => {
									setOptions(place ? [place, ...options] : options);
									handlePlaceChange(place);
								}}
								onInputChange={(event, newInputValue) => {
									setInputValue(newInputValue);
								}}
								renderInput={(params) => (
									<TextField
										{...params}
										className={classes.field}
										label="Location"
										variant="outlined"
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
												<LocationOnIcon className={classes.icon} />
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
							<Row vertical="center" horizontal="space-between">
								{/* <ImageDropZoneComponent
									file={files.image0}
									setFile={handleFileState}
									id={"image0"}
								/>
								{files.image0 != null ? (
									<ImageDropZoneComponent
										file={files.image1}
										setFile={handleFileState}
										id={"image1"}
									/>
								) : (
									""
								)}
								{files.image1 != null ? (
									<ImageDropZoneComponent
										file={files.image2}
										setFile={handleFileState}
										id={"image2"}
									/>
								) : (
									""
								)}
								{files.image2 != null ? (
									<ImageDropZoneComponent
										file={files.image3}
										setFile={handleFileState}
										id={"image3"}
									/>
								) : (
									""
								)}
								{files.image3 != null ? (
									<ImageDropZoneComponent
										file={files.image4}
										setFile={handleFileState}
										id={"image4"}
									/>
								) : (
									""
								)} */}
								{Object.keys(files).map((key) => {
									return (
										<ImageDropZoneComponent
											key={key}
											files={files}
											setFile={handleFileState}
											id={key}
										/>
									);
								})}

								{/* <ImageDropZoneComponent
									file={files.image0}
									setFile={handleFileState}
									id={"image0"}
								/> */}

								{/* <ImageDropZoneComponent
									file={files.image1}
									setFile={handleFileState}
									id={"image1"}
								/> */}

								{/* <ImageDropZoneComponent
									file={files.image2}
									setFile={handleFileState}
									id={"image2"}
								/>

								<ImageDropZoneComponent
									file={files.image3}
									setFile={handleFileState}
									id={"image3"}
								/>

								<ImageDropZoneComponent
									file={files.image4}
									setFile={handleFileState}
									id={"image4"}
								/> */}
							</Row>
							<FormControl
								required
								className={classes.field}
								variant="outlined"
							>
								<InputLabel htmlFor="outlined-adornment-password">
									Password
								</InputLabel>
								<OutlinedInput
									id="outlined-adornment-password"
									type={state.showPassword ? "text" : "password"}
									value={values.password || ""}
									onChange={handleChange("password")}
									endAdornment={
										<InputAdornment position="end">
											<IconButton
												aria-label="toggle password visibility"
												onClick={handleClickShowPassword}
												onMouseDown={handleMouseDownPassword}
												edge="end"
												style={{ color: "#ff596a" }}
											>
												{state.showPassword ? (
													<Visibility />
												) : (
													<VisibilityOff />
												)}
											</IconButton>
										</InputAdornment>
									}
									labelWidth={70}
								/>
							</FormControl>
							<Button
								className={classes.btn}
								onClick={updateProfile}
								variant="contained"
							>
								{state.isBusy ? (
									<CircularProgress className={classes.spinner} />
								) : (
									"Update Profile"
								)}
							</Button>
						</Column>
					</form>
				</Column>
			</DialogContent>
		</Dialog>
	);
};
