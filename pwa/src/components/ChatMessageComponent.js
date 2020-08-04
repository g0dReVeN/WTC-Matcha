import React from "react";

export default ({ chat, user }) => (
	<li className={`chat ${user === chat.username ? "right" : "left"}`}>
		{user !== chat.username && (
			<img src={chat.img} alt={`${chat.username}'s profile pic`} />
		)}
		{chat.content}
	</li>
);
