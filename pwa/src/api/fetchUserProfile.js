import jwt from 'jsonwebtoken';

export default () => {
	return jwt.decode(localStorage.access_token, { json: true });
}