const express = require('express');
const http = require('http');
const cors = require('cors');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const { server_port } = require('./config/config');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let clients = [];

const ConnectedModel = require('./models/connected');
const NotificationModel = require('./models/notifications');
// const MessageNotificationModel = require('./models/messageNotification');
const UserNotificationModel = require('./models/notifications');
const crude = require('./config/db');


const jwtAuth = require('./middleware/jwtAuth');
const userAction = require('./middleware/userAction');

const sendNotification = async (user_id, newEntry) => {
	try {
		const UserNotification = await UserNotificationModel;
		const userNotification = await UserNotification.findOne({ user_id });
		if (!userNotification) {
			await new UserNotification({
				user_id,
				notification_list: [newEntry]
			});
		} else {
			const notification_list = userNotification.notification_list;
			notification_list.push(newEntry);
			await UserNotification.update({ notification_list }, { user_id });
		}
	} catch (e) {
		console.log(e);
		throw TypeError("Error adding notification");
	}
}

io.on('connection', socket => {
	socket.on('join', ({ id, username }, cb) => {
		socket.join('notifications');
		clients.push({ id, username, socket_id: socket.id });
		cb();
	});

	socket.on('toggle', async ({ token = null, action = null, user_id = null, username = null }, cb) => {
		try {
			const response = await jwtAuth.verifyToken(token);
			if (response.success === false)
				return cb({ status: 400, success: false, msg: 'Token invalid' });
			const user = response.user;

			await userAction({ user, action, user_id, username }, async actionResponse => {
				cb(actionResponse);

				let current_user;
				let other_user;
				clients.forEach(client => {
					if (client.username === username)
						other_user = client;
					if (client.socket_id === socket.id)
						current_user = client;
				});
				let newEntry;
				if (actionResponse.action === 'like')
					newEntry = { action: 'like', user_id: current_user.id, username: current_user.username, read: false };
				else if (action === 'unlike')
					newEntry = { action: 'unlike', user_id: current_user.id, username: current_user.username, read: false };
				else if (action === 'connect')
					newEntry = { action: 'connect', user_id: current_user.id, username: current_user.username, read: false };
				else if (action === 'disconnect')
					newEntry = { action: 'disconnect', user_id: current_user.id, username: current_user.username, read: false };
				else if (action === 'consult')
					newEntry = { action: 'like', user_id: current_user.id, username: current_user.username, read: false };
				if (other_user)
					io.to(other_user.socket_id).emit('notification', newEntry);
				try {
					await sendNotification(user_id, newEntry);
				} catch (e) {
					console.log(e);
					return cb({ status: 500, success: false, msg: 'Internal server error' });
				}
			});
		} catch (e) {
			console.log(e);
			return cb({ status: 500, success: false, msg: 'Internal server error' });
		}
	});

	socket.on('sendMessage', async ({ messageEntry, room }, cb) => {
		let current_user;
		clients.forEach(client => {
			if (client.socket_id === socket.id)
				current_user = client;
		});
		let other_user;
		const users_usernames = room.split('-');
		let other_user_username;
		if (users_usernames[0] != current_user.username)
			other_user_username = users_usernames[0];
		else
			other_user_username = users_usernames[1];
		clients.forEach(client => {
			if (client.username === other_user_username)
				other_user = client;
		});
		// const messageEntryString = JSON.stringify(messageEntry);
		// console.log(messageEntryString);
		try {
			const Connected = await ConnectedModel;
			const connected = await Connected.findOne({ room });
			if (!connected)
				return cb(false);
			const messages = connected.messages;
			messages.push(messageEntry);
			await Connected.update({ messages }, { room });
			// const queryResult = await crude.conn.query(`UPDATE connected_users SET messages = array_cat(messages, '{${messageEntryString}}') WHERE room = '${room}'`);
		} catch (e) {
			cb(false);
			return console.log(e);
		}
		if (other_user)
			socket.to(other_user.socket_id).emit('message', { room, messageEntry });
		cb(true);
	});

	socket.on('disconnect', () => {
		let socket_id;
		clients.forEach(client => {
			if (client.socket_id === socket.id) {
				socket_id = client.socket_id;
			}
		});
		if (socket_id) {
			clients = clients.filter(value => value.socket_id != socket_id);
			socket.leave('notifications');
		}
	});
});

const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const { conn } = require('./config/db');

app.use(authRouter);
app.use('/user', userRouter);

server.listen(server_port, () => {
	console.log("Server is listening on port: ", server_port);
});