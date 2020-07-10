import axios from 'axios';

export default (payload) => {
	axios.post(process.env.REACT_APP_API_URL + '/validateResetToken', payload)
		.then(res => {
			localStorage.clear();
			if (res.status === 200) {
				return true;
			}
			else {
				return false;
			}
		}).catch(err => {
			console.log(err.response);
		});
};