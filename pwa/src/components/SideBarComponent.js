import React from "react";
import axios from "axios";
import { Row, Column } from "simple-flexbox";
import { StyleSheet, css } from "aphrodite";
import ProfileBarComponent from "./ProfileBarComponent";
import UserNotificationPanelComponent from "./UserNotificationPanelComponent";
import HistoryListComponent from "./HistoryListComponent";
import MessageListComponent from "./MessageListComponent";
import NotificationListComponent from "./NotificationListComponent";
import ChatboxComponent from "./ChatboxComponent";
import { SocketContext } from "../contexts/socket";

const styles = StyleSheet.create({
	container: {
		width: 350,
		//paddingTop: 32,
		borderRight: "1px solid #e0e4e9",
	},
	menuItemList: {
		marginTop: 52,
	},
	separator: {
		borderTop: "1px solid #DFE0EB",
		marginTop: 16,
		marginBottom: 16,
		opacity: 0.06,
	},
});

export default (props) => {
	const socket = React.useContext(SocketContext);

	const [tab, setTab] = React.useState("messages");

	const [messageBell, setMessageBell] = React.useState(false);

	const [notificationBell, setNotificationBell] = React.useState(false);

	const [notifications, setNotifications] = React.useState([]);

	const [chats, setChats] = React.useState([]);

	const [chat, setChat] = React.useState('');

	React.useEffect(() => {
		axios
			.get(process.env.REACT_APP_API_URL + "/user/notification", {
				headers: {
					Authorization: localStorage.access_token,
				},
			})
			.then((res) => {
				setNotifications(res.data.notification_list);
			})
			.catch((err) => {
				console.log(err);
			});

		socket.emit(
			"join",
			{ id: props.userInfo.id, username: props.userInfo.username },
			() => {
				// empty callback but it's here in case you wanna do something after.
			}
		);

		// return () => {
		// 	socket.emit("disconnect");
		// 	socket.disconnect();
		// };
	}, []);

	React.useEffect(() => {
		socket.on("notification", (newEntry) => {
			setNotificationBell(true);
			setNotifications((notifications) => [...notifications, newEntry]);
		});
	}, []);

	React.useEffect(() => {
		socket.on("message", ({ room, messageEntry }) => {
			let foundChat;
			chats.forEach(chat => {
				if (chat.room === room) {
					foundChat = chat;
					return;
				}
			});
			if (foundChat) {
				const index = chats.indexOf(foundChat);
				const newChat = { ...foundChat };
				newChat.messages.push(messageEntry);
				if (index !== -1) {
					if (chat.room === newChat.room)
						setChat(newChat);
					setChats(prevChats => {
						prevChats[index] = newChat;
						return prevChats;
					});
					setMessageBell(true);
				}
			}
		});
	}, [chats]);

	React.useEffect(() => {
		axios
			.get(process.env.REACT_APP_API_URL + "/user/connected", {
				headers: {
					Authorization: localStorage.access_token,
				},
			})
			.then((res) => {
				setChats(res.data.users);
			})
			.catch((err) => {
				console.log(err);
			});

		// socket.emit(
		// 	"join",
		// 	{ id: props.userInfo.id, username: props.userInfo.username },
		// 	() => {
		// 		// empty callback but it's here in case you wanna do something after.
		// 	}
		// );

		// return () => {
		// 	socket.emit("disconnect");
		// 	socket.disconnect();
		// };
	}, []);

	React.useEffect(() => {
		socket.on("chats", (newEntry) => {
			setChats((chats) => [...chats, newEntry]);
		});
	}, []);

	const submitMessage = entry => {
		chat.messages.push(entry);
	}

	return (
		<div style={{ position: "relative" }}>
			<Row
				className={css(styles.mainContainer)}
				breakpoints={{
					152: css(styles.mainContainerMobile, styles.mainContainerExpanded),
				}}
			>
				<Column
					className={css(styles.container)}
					breakpoints={{ 15: css(styles.containerMobile) }}
				>
					<ProfileBarComponent
						{...props.userInfo}
						openProfile={props.openProfile}
					/>
				</Column>
			</Row>
			<Row>
				<Column>
					<UserNotificationPanelComponent
						tab={tab}
						setTab={setTab}
						messageBell={messageBell}
						notificationBell={""}
					/>
					{tab === "history" ? (
						<HistoryListComponent key={"history"} />
					) : tab === "messages" ? (
						<MessageListComponent key={"messages"} profiles={chats} userInfo={props.userInfo} setTab={setTab} setChat={setChat} />
					) : tab === "notifications" ? (
						<NotificationListComponent setNotificationBell={setNotificationBell} key={"notifications"} profiles={notifications} />
					) : tab === "chatbox" ? (
						<ChatboxComponent key={"chatbox"} setMessageBell={setMessageBell} chat={chat} userInfo={props.userInfo} submitMessage={submitMessage} />
					) : (
										""
									)}
				</Column>
			</Row>
		</div>
	);
};