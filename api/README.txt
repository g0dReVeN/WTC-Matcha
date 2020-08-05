***API REFERENCE GUIDE***

>>AUTHENTICATION ENDPOINTS<<

Registering a new user (An email will be sent to the given email for verification):
URL			-	http://localhost:5000/register
METHOD		-	POST
BODY		-	{
					username: String, (min: 4, max: 15)
					firstname: String,
					lastname: String,
					email: String,
					password: String (min: 6, max: 12)
				}
RESPONSE	-	SUCCESSFUL
				http code 201
				{
					success: true,
					msg: "User created"
				}
			-	UNSUCCESSFUL
				http code 409
				{
					success: false,
					msg: "'Username already exists'"
				}
				http code 409
				{
					success: false,
					msg: "'User with this email already exists'"
				}
				http code 422
				{
					success: false,
					msg: "[
						'Username needs to be between 4 and 15 characters',
						'Please enter a valid email.',
						'Password needs to be alphanumeric between 6 and 12 characters'
						]"
				}
				http code 500
				{
					success: false,
					msg: "Internal server error"
				}

Confirmation of newly created user (A user is verified by clicking the link sent to their given email after registration):
URL			-	http://localhost:5000/confirm
METHOD		-	PATCH
BODY		-	{
					reset_token: String,
					username: String
				}
RESPONSE	-	SUCCESSFUL
				http code 200
				{
					success: true,
					msg: "User verified. Token attached",
					{token}
				}
			-	UNSUCCESSFUL
				http code 400
				{
					success: false,
					msg: "Invalid token given or username given"
				}
				http code 422
				{
					success: false,
					msg: "['Username needs to be between 4 and 15 characters']"
				}
				http code 500
				{
					success: false,
					msg: "Token could not be generated at this time"
				}
				http code 500
				{
					success: false,
					msg: "Internal server error"
				}

Logging in a user (A JWT is returned to be used for subsequent requests upon success):
URL			-	http://localhost:5000/login
METHOD		-	POST
BODY		-	{
					username: String, (min: 4, max: 15)
					password: String (min: 6, max: 12)
				}
RESPONSE	-	SUCCESSFUL
				http code 200
				{
					success: true,
					msg: "User exists. Token attached",
					{token}
				}
			-	UNSUCCESSFUL
				http code 400
				{
					success: false,
					msg: "User not found"
				}
				http code 422
				{
					success: false,
					msg: "[
						'Username needs to be between 4 and 15 characters',
						'Password needs be alphanumeric between 6 and 12 characters'
						]"
				}
				http code 403
				{
					success: false,
					msg: "User not active"
				}
				http code 401
				{
					success: false,
					msg: "Password is invalid"
				}
				http code 500
				{
					success: false,
					msg: "Token could not be generated at this time"
				}
				http code 500
				{
					success: false,
					msg: "Internal server error"
				}

Forgot password (Interchangeably handles both 'forgot password' and logged in users who request to change their password):
URL			-	http://localhost:5000/forgotPassword
METHOD		-	PATCH
BODY		-	{
					username: String, (min: 4, max: 15)
					forgot: Boolean (true: forgot password, false: request to change password)
				}
RESPONSE	-	SUCCESSFUL
				http code 200 (forgot = true)
				{
					success: true,
					msg: "Change password email has been sent to the user"
				}
				http code 200 (forgot = false)
				{
					success: true,
					msg: "Token attached",
					resetToken: String
				}
			-	UNSUCCESSFUL
				http code 404
				{
					success: false,
					msg: "User not found"
				}
				http code 422
				{
					success: false,
					msg: "[
						'Username needs to be between 4 and 15 characters',
						'Forgot needs to be a boolean value'
						]"
				}
				http code 500
				{
					success: false,
					msg: "Internal server error"
				}

Change password (The new password along with the resetToken received from the 'Forgot password'  is provided):
URL			-	http://localhost:5000/changePassword
METHOD		-	PATCH
BODY		-	{
					username: String, (min: 4, max: 15)
					password: String, (min: 6, max: 12)
					reset_token: String
				}
RESPONSE	-	SUCCESSFUL
				http code 200
				{
					success: true,
					msg: "User has successfully changed their password"
				}
			-	UNSUCCESSFUL
				http code 404
				{
					success: false,
					msg: "Invalid username and/or token, or token has expired"
				}
				http code 422
				{
					success: false,
					msg: "[
						'Username needs to be between 4 and 15 characters',
						'Password needs be alphanumeric between 6 and 12 characters',
						'Reset token needs to be alphanumeric'
						]"
				}
				http code 500
				{
					success: false,
					msg: "Internal server error"
				}

Validate Reset Token:
URL			-	http://localhost:5000/validateResetToken
METHOD		-	POST
BODY		-	{
					username: String, (min: 4, max: 15)
					reset_token: String
				}
RESPONSE	-	SUCCESSFUL
				http code 200
				{
					success: true,
					msg: "Reset Token valid"
				}
			-	UNSUCCESSFUL
				http code 400
				{
					success: false,
					msg: "Reset Token invalid or has expired"
				}
				http code 422
				{
					success: false,
					msg: "[
						'Username needs to be between 4 and 15 characters'
						]"
				}
				http code 500
				{
					success: false,
					msg: "Internal server error"
				}

>>USER ENDPOINTS<<

Edit profile (Format of location still needs to be decided):
URL			-	http://localhost:5000/user/editProfile
METHOD		-	PATCH
BODY		-	{
					username: String, (min: 4, max: 15) {optional}
					firstname: String, {optional}
					lastname: String, {optional}
					email: String, {optional}
					password: String, (min: 6, max: 12) {optional}
					age: Number, {optional}
					lat: Number, {optional}
					long: Number, {optional}
					location: {
						lat: Number,
						long, Number
					}, {optional}
					gender: Number, (1: male, 2: female) {optional}
					sexualPreference: Number (0: bisexual(default), 1: male, 2: female), {optional}
					tags: [String], {optional}
					biography: String {optional}
				}
RESPONSE	-	SUCCESSFUL
				http code 200
				{
					success: true,
					msg: "User profile updated",
					token: {jwt}
				}
			-	UNSUCCESSFUL
				http code 500
				{
					success: false,
					msg: "Internal server error",
					token: {jwt}
				}
				http code 500
				{
					success: false,
					msg: "Token could not be generated at this time"
				}
				http code 422
				{
					success: false,
					msg: "[
						'Username needs to be between 4 and 15 characters',
						'Firstname needs to be between 4 and 15 characters',
						'Lastname needs to be between 4 and 15 characters',
						'Please enter a valid email',
						'Password needs to be alphanumeric between 6 and 12 characters',
						'Age needs to be a number between 18 and 70',
						'Lat needs to be a number',
						'Long needs to be a number',
						'Location needs to be of type JSON',
						'Gender needs to be a number of values '0' or '1' to represent male and female respectively',
						'Sexual preference needs to be a number of values '0', '1' or '2' to represent bisexual, male and female respectively',
						'Tags needs to be an array of characters',
						'Biography needs to contain characters'
						]"
				}

Retrieve user history (List of all users the current user has consulted):
URL			-	http://localhost:5000/user/history
METHOD		-	GET
RESPONSE	-	SUCCESSFUL
				http code 200
				{
					success: true,
					msg: "History list found",
					users: [user],
					token: {jwt}
				}
			-	UNSUCCESSFUL
				http code 500
				{
					success: false,
					msg: "Internal server error",
					token: {jwt}
				}
				http code 500
				{
					success: false,
					msg: "Token could not be generated at this time"
				}

Retrieve user likes (List of all users the current user has liked):
URL			-	http://localhost:5000/user/likes
METHOD		-	GET
RESPONSE	-	SUCCESSFUL
				http code 200
				{
					success: true,
					msg: "Like list found",
					users: [user],
					token: {jwt}
				}
			-	UNSUCCESSFUL
				http code 500
				{
					success: false,
					msg: "Internal server error",
					token: {jwt}
				}
				http code 500
				{
					success: false,
					msg: "Token could not be generated at this time"
				}

Retrieve users reported by current user (List of all users the current user has reported):
URL			-	http://localhost:5000/user/report
METHOD		-	GET
RESPONSE	-	SUCCESSFUL
				http code 200
				{
					success: true,
					msg: "Report list found",
					users: [user],
					token: {jwt}
				}
			-	UNSUCCESSFUL
				http code 500
				{
					success: false,
					msg: "Internal server error",
					token: {jwt}
				}
				http code 500
				{
					success: false,
					msg: "Token could not be generated at this time"
				}

Retrieve users (based on filters):
URL			-	http://localhost:5000/user/filteredUsers
METHOD		-	POST
BODY		-	{
					age: {
						low: Number,
						high: Number
					},
					fame_rating: {
						low: Number,
						high: Number
					},
					tags: Array, (if tags should be ignored, put in an empty array)
					distance: Number (measured in metres)
				}
RESPONSE	-	SUCCESSFUL
				http code 200
				{
					success: true,
					msg: "Users found",
					users: [user],
					token: {jwt}
				}
			-	UNSUCCESSFUL
				http code 500
				{
					success: false,
					msg: "Internal server error",
					token: {jwt}
				}
				http code 400
				{
					success: false,
					msg: "Insufficient or incorrect values posted",
					token: {jwt}
				}
				http code 400
				{
					success: false,
					msg: "User has not completed their profile yet",
					token: {jwt}
				}
				http code 400
				{
					success: false,
					msg: "User has not set their location yet",
					token: {jwt}
				}
				http code 500
				{
					success: false,
					msg: "Token could not be generated at this time"
				}

Toggle user like, unlike, consult, report and block
URL				- http://localhost:5000/user/action
METHOD		- PATCH
BODY			-	{
						action: String, ('like', || 'consult' || 'block' || 'report'}
						user_id: Number,
						username: String (add for 'like' or 'unlike', else leave null)
					}
RESPONSE	- SUCCESSFUL
				http code 200 (action === 'like')
				{
					action: 'like',
					success: true,
					msg: "Like added",
					token: {jwt}
				}
				http code 200 (action === 'like')
				{
					action: 'unlike',
					success: true,
					msg: "Like removed",
					token: {jwt}
				}
				http code 200 (action === 'like')
				{
					action: 'connect',
					success: true,
					msg: "Like added and users are now connected",
					token: {jwt}
				}
				http code 200 (action === 'like')
				{
					action: 'disconnect',
					success: true,
					msg: "Like removed and users are now disconnected",
					token: {jwt}
				}
				http code 200 (action === 'consult')
				{
					action: 'consult',
					success: true,
					msg: "Consult added",
					token: {jwt}
				}
				http code 200 (action === 'block')
				{
					action: 'block',
					success: true,
					msg: "Blocked user added",
					token: {jwt}
				}
				http code 200 (action === 'block')
				{
					action: 'unblock',
					success: true,
					msg: "Blocked user removed",
					token: {jwt}
				}
				http code 200 (action === 'report')
				{
					action: 'report',
					success: true,
					msg: "User report added",
					token: {jwt}
				}
				http code 200 (action === 'report')
				{
					action: 'unreport',
					success: true,
					msg: "User report removed",
					token: {jwt}
				}
			-	UNSUCCESSFUL
				http code 400 (action === 'like')
				{
					success: false,
					msg: "No user_id and username given",
					token: {jwt}
				}
				http code 400 (action === 'consult' || action === 'block' || action === 'report')
				{
					success: false,
					msg: "No user_id given",
					token: {jwt}
				}
				http code 500
				{
					success: false,
					msg: "Internal server error",
					token: {jwt}
				}
				http code 500
				{
					success: false,
					msg: "Token could not be generated at this time"
				}

Download image (response is sent with res.sendFile({filepath})):
URL			-	http://localhost:5000/user/downloads/{img}
METHOD		-	GET
RESPONSE	-	SUCCESSFUL
				http code 200
				{
					{file}
				}
			-	UNSUCCESSFUL
				http code 500
				{
					success: false,
					msg: "Internal server error",
					token: {jwt}
				}
				http code 404
				{
					success: false,
					msg: "Image not found",
					token: {jwt}
				}
				http code 500
				{
					success: false,
					msg: "Token could not be generated at this time"
				}

Retrieve all tags ever submitted in a list:
URL			-	http://localhost:5000/user/tags
METHOD		-	GET
RESPONSE	-	SUCCESSFUL
				http code 200 (if no user has submitted a tag yet)
				{
					success: true,
					msg: "No tags available",
					tags: [null],
					token: {jwt}
				}
				http code 200
				{
					success: true,
					msg: "Tags found",
					tags: [tag],
					token: {jwt}
				}
			-	UNSUCCESSFUL
				http code 500
				{
					success: false,
					msg: "Internal server error",
					token: {jwt}
				}
				http code 500
				{
					success: false,
					msg: "Token could not be generated at this time"
				}

Retrieve user notifications:
URL			-	http://localhost:5000/user/notification
METHOD		-	GET
RESPONSE	-	SUCCESSFUL
				http code 200 (if there are no notifications yet)
				{
					success: true,
					msg: "Notification list found",
					notification_list: [null],
					token: {jwt}
				}
				http code 200
				{
					success: true,
					msg: "Notification list found",
					notification_list: [notification],
					token: {jwt}
				}
			-	UNSUCCESSFUL
				http code 500
				{
					success: false,
					msg: "Internal server error",
					token: {jwt}
				}
				http code 500
				{
					success: false,
					msg: "Token could not be generated at this time"
				}

Retrieve user:
URL			-	http://localhost:5000/user/{id}
METHOD		-	GET
RESPONSE	-	SUCCESSFUL
				http code 200 (if there are no notifications yet)
				{
					success: true,
					msg: "User found",
					user: {user},
					token: {jwt}
				}
			-	UNSUCCESSFUL
				http code 500
				{
					success: false,
					msg: "Internal server error",
					token: {jwt}
				}
				http code 500
				{
					success: false,
					msg: "Token could not be generated at this time"
				}
				http code 404
				{
					success: false,
					msg: "User not found",
					token: {jwt}
				}