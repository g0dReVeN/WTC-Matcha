import React from "react";

const getTime = (dateTime) => {
	const dateObject = new Date(dateTime);
	const hours = dateObject.getHours();
	const minutes = dateObject.getMinutes();
	return `${hours}:${minutes}`;
}

export default ({ chat, user }) => (
	<li className={`chat ${user === chat.username ? "right" : "left"}`}>
		<p>{chat.message}</p><p style={{ float: "right", margin: 0 }}>{getTime(chat.dateTime)}</p>
	</li>
);
