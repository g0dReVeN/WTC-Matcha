import React from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import * as QueryString from "query-string";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
	spinner: {
		marging: "auto",
		width: "200px",
		height: "200px",
		color: "#ff596a",
	},
}));

export default function WaitPage(props) {
	const classes = useStyles();
	const history = useHistory();
	const params = QueryString.parse(props.location.search);

	if (params.reset_token && params.username) {
		axios
			.patch(process.env.REACT_APP_API_URL + "/confirm", params)
			.then((res) => {
				if (res.status === 200) {
					localStorage.clear();
					localStorage.access_token = res.data.token;
					history.push("/");
				}
			})
			.catch((err) => console.error(err.response));
	}

	return <CircularProgress className={classes.spinner} />;
}
