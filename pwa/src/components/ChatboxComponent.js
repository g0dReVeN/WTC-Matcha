import React from "react";
import "../App.css";

import Message from "./ChatMessageComponent";
import ChatInputComponent from "./ChatInputComponent";
import { SocketContext } from "../contexts/socket";

export default (props) => {
	const socket = React.useContext(SocketContext);
	const [message, setMessage] = React.useState('');
	const scrollRef = React.useRef(null);

	React.useEffect(() => {
		props.setMessageBell(false);
		scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
	});

	const handleInputChange = (input) => {
		setMessage(input);
	}

	const submitMessage = e => {
		e.preventDefault();
		const messageEntry = { username: props.userInfo.username, message, dateTime: new Date().toString() };
		socket.emit('sendMessage', { messageEntry, room: props.chat.room }, cb => {
			if (cb)
				props.submitMessage(messageEntry);
			else
				props.submitMessage('Error sending message');
			setMessage('');
		});
	}

	return (
		<div className="chatroom">
			<ul className="chats" ref={scrollRef}>
				{props.chat.messages.map((message, index) => (
					<Message chat={message} user={props.userInfo.username} key={index} />
				))}
			</ul>
			<form onSubmit={e => submitMessage(e)}>
				<ChatInputComponent message={message} handleInputChange={handleInputChange} />
			</form>
		</div>
	);
}
