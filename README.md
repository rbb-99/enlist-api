## ENLIST API

### Features
- Create, Read, Update, Delete errands by authorised user
- Signup, Signin, Sign Out (of all devices/sessions) a user
- Upload/remove an avatar for user profile
- Delete profile

### Env variables
Create a config folder in the root directory and add two files: dev.env, test.env. Both containing the same content as below except for mongodb url which is different for development and testing (if you make it so).
```
PORT=3000
SENDGRID_API_KEY=<your sendgrid api key>
JWT_SECRET=<any sequence of characters>
MONGODB_URL=<your mongodb uri>
SENDGRID_REGISTERED_MAIL_ID=<sendgrid mail id>
```
