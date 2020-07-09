const express = require('express');
const cors = require('cors');

const app = express();

const { server_port } = require('./config/config');

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');

app.use(authRouter);
app.use('/user', userRouter);

app.listen(server_port, () => {
    console.log("Server is listening on port: ", server_port);
});