# User Accounts with ExpressJS

Almost every app I build needs to manage user accounts: Sign up users, login users, let users update their profiles, password reset, user permissions, control access to resources based on permissions and on resource ownership. In this project I attempt a best practice implementation using [Passport](http://www.passportjs.org/).

I build the UI mobile first using Bootstrap. UX design is influenced by Basecamp.com.

## Initial setup

Create an ExpressJS app.

```sh
mkdir user-accounts-express
cd user-accounts-express
touch README.md
touch index.js
mkdir views
mkdir views/includes
touch views/includes/head.pug
touch views/includes/nav.pug
mkdir views/pages
touch views/pages/index.pug
touch views/pages/404.pug
touch views/pages/500.pug
mkdir public
mkdir public/stylesheets
touch public/stylesheets/main.css
git init
git remote add origin https://github.com/davidjohnmaccallum/user-accounts-express.git
npm init -y
npm install --save express pug body-parser mongodb getenv morgan
npm install --save-dev eslint nodemon
npx eslint --init
echo "node_modules/" >> .gitignore
git add .
git commit -m "Initial setup"
git push -u origin master
```

## Sign up and login the traditional way

Sign up via a form and log in with a username and password. I am using the users email address as password. This is because the email address is unique and rarely changes.

```sh
npm install --save passport passport-local connect-flash cookie-parser express-session express-validator bcrypt
touch views/pages/signup.pug
touch views/pages/login.pug
touch views/pages/protected.pug
touch public/stylesheets/login.css
mkdir lib
touch lib/mongoClient.js
touch lib/localAuthStrategy.js
```

Tell Passport how to authenticate a user by creating a LocalStrategy. See lib/localAuthStrategy.js.

Setup the scripts for the login page. See lib/setupAuthRoutes.js.

Setup the scripts for sign up, and my profile pages. See lib/setupAccountManagementRoutes.js. (TODO: Forgot password)

Setup middleware to enforce auth and permissions on routes. See lib/routeGuard.js.

## Sign up and log in using Google

Sign up and log in via OAuth and the user's Google account. I'm following the [Passport Google Provider](http://www.passportjs.org/docs/google/) doc.

```sh
npm install --save passport-google-oauth
```

Create a new project at [Google Developers Console](https://console.developers.google.com/).

Configure the consent screen here: https://console.developers.google.com/apis/credentials.

1. I chose external users.
1. I set the application name to "User Accounts with ExpressJS" and left all other fields blank/default.

Create credentials here: https://console.developers.google.com/apis/credentials

1. I chose OAuth Client ID, then Web Application.
1. I set the name to "User Accounts with ExpressJS"
1. I added an Authorised redirect URI of http://localhost:3000/auth/google/callback
1. I left other fields blank and saved.
1. A dialog shows my Client ID and Client Secret which I store in LastPass.

Set up the Google Auth Strategy. See lib/googleAuthStrategy.js.

## Environment Variables

This app uses the following environment variables:

| Variable             | Description                                |
| -------------------- | ------------------------------------------ |
| DEBUG                | Enables debug logs (true/false).           |
| GOOGLE_CLIENT_ID     | See http://www.passportjs.org/docs/google/ |
| GOOGLE_CLIENT_SECRET | See http://www.passportjs.org/docs/google/ |
| MONGO_PASSWORD       | Database password.                         |
| MONGO_USERNAME       | Database username.                         |
| MONGO_HOSTNAME       | Database hostname.                         |
