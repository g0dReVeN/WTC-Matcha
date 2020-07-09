import axios from 'axios';

export default (payload) => {
	axios.post(process.env.REACT_APP_API_URL + '/validateResetToken', payload)
		.then(res => {
			localStorage.clear();
			console.log(res.msg);
			if (res.status === 200) {
				console.log('true');
				return true;
			}
			else {
				console.log('false');
				return false;
			}
		}).catch(err => {
			console.log(err.response);
		});
};