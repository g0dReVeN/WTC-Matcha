import { useParams } from 'react-router-dom';
import RootComponent from '../components/RootComponent';
import LoginComponent from '../components/LoginComponent';
import RegisterComponent from '../components/RegisterComponent';
import ForgotPasswordComponent from '../components/ForgotPasswordComponent';
import ResetPasswordComponent from '../components/ResetPasswordComponent';
import PageNotFoundComponent from '../components/PageNotFoundComponent';
import validateResetToken from '../api/validateResetToken';
import fetchUserProfile from '../api/fetchUserProfile';

const routes = [
	{
		path: '/',
		component: RootComponent,
		fetchInitialData: () => fetchUserProfile(),
		auth: true,
	},
	{
		path: '/login',
		component: LoginComponent,
		fetchInitialData: false,
		auth: false,
	},
	{
		path: '/register',
		component: RegisterComponent,
		fetchInitialData: false,
		auth: false,
	},
	{
		path: '/confirm',
		component: PageNotFoundComponent,
		fetchInitialData: false,
		auth: false,
	},
	{
		path: '/forgotPassword',
		component: ForgotPasswordComponent,
		fetchInitialData: false,
		auth: false,
	},
	{
		path: '/changePassword/:resetToken',
		component: ResetPasswordComponent,
		fetchInitialData: (payload) => validateResetToken(payload),
		auth: false,
	},
	{
		path: '*',
		component: PageNotFoundComponent,
		fetchInitialData: false,
		auth: false,
	},
];

export default routes;