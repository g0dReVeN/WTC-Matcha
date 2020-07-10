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
						'Username has to be between 4 and 15 characters.',
						'Please enter a valid email.',
						'Password has to be alphanumeric and between 6 and 12 characters.'
						]"
				}
				http code 500
				{
					success: false,
					msg: "Internal server error",
					{errorMessage}
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
					msg: "['Username has to be between 4 and 15 characters.']"
				}
				http code 500
				{
					success: false,
					msg: "Token could not be generated at this time"
				}
				http code 500
				{
					success: false,
					msg: "Internal server error",
					{errorMessage}
				}

Logging in a user (A JWT is returned to be used for subsequent requests upon success):
URL			-	http://localhost:5000/register
METHOD		-	POST
BODY		-	{
					username: String,
					password: String
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
						'Username has to be between 4 and 15 characters.',
						'Password has to be alphanumeric and between 6 and 12 characters.'
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
					msg: "Internal server error",
					{errorMessage}
				}

Forgot password (Interchangeably handles both 'forgot password' and logged in users who request to change their password):
URL			-	http://localhost:5000/forgotPassword
METHOD		-	PATCH
BODY		-	{
					username: String,
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
					msg: "Invalid username"
				}
				http code 422
				{
					success: false,
					msg: "[
						'Username has to be between 4 and 15 characters.',
						'Forgot needs to be a boolean value'
						]"
				}
				http code 500
				{
					success: false,
					msg: "Internal server error",
					{err}
				}

Change password (The new password along with the resetToken received from the 'Forgot password'  is provided):
URL			-	http://localhost:5000/forgotPassword
METHOD		-	PATCH
BODY		-	{
					username: String,
					password: String,
					reset_token: String
				}
RESPONSE	-	SUCCESSFUL
				http code 200
				{
					success: true,
					msg: "User successfully changed their password"
				}
			-	UNSUCCESSFUL
				http code 404
				{
					success: false,
					msg: "Invalid username and/or token"
				}
				http code 422
				{
					success: false,
					msg: "[
						'Username has to be between 4 and 15 characters.',
						'Password has be alphanumeric and be between 6 and 12 characters.'
						]"
				}
				http code 500
				{
					success: false,
					msg: "Internal server error",
					{err}
				}

Validate Reset Token:
URL			-	http://localhost:5000/validateResetToken
METHOD		-	POST
BODY		-	{
					username: String,
					resetToken: String
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
					msg: "Reset Token invalid"
				}
				http code 422
				{
					success: false,
					msg: "[
						'Username has to be between 4 and 15 characters.'
						]"
				}
				http code 500
				{
					success: false,
					msg: "Internal server error",
					{err}
				}

>>USER ENDPOINTS<<

Update profile (Format of location still needs to be decided):
URL			-	http://localhost:5000/user/profile
METHOD		-	POST
BODY		-	{
					age: Number,
					location: {
						lat: Number,
						long, Number
					},
					gender: Boolean,
					sexualPreference: Number (0: bisexual, 1: male, 2: female),
					biography: String,
					tags: [String]
				}
RESPONSE	-	SUCCESSFUL
				http code 200
				{
					success: true,
					msg: "User profile updated"
				}
			-	UNSUCCESSFUL
				http code 500
				{
					success: false,
					msg: "Internal server error",
					{err}
				}

Retrieve users (based on filters):
URL			-	http://localhost:5000/user/retrieveFilteredUsers
METHOD		-	GET
BODY		-	{
					age: {
						low: Number,
						high: Number
					},
					fame_rating: {
						low: Number,
						high: Number
					},
					tags: Array,
					(Still to be added:
						location: {
							lat: Number,
							long, Number
						}
					)
				}
RESPONSE	-	SUCCESSFUL
				http code 200
				{
					success: true,
					msg: "Found users mathcing filters"
				}
			-	UNSUCCESSFUL
				http code 500
				{
					success: false,
					msg: "Internal server error",
					{err}
				}

Post a new history document (A new document is added to history when a user likes or dislikes another user):
URL			-	http://localhost:5000/user/addHistory
METHOD		-	POST
BODY		-	{
					user: Number(Mongoose.Schema.Types.ObjectId),
					like: Boolean
				}
RESPONSE	-	SUCCESSFUL
				http code 200
				{
					success: true,
					msg: "History added"
				}
			-	UNSUCCESSFUL
				http code 500
				{
					success: false,
					msg: "Error adding history",
					{err}
				}
				http code 500
				{
					success: false,
					msg: "Internal server error",
					{err}
				}