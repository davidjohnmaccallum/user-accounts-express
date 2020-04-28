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
npm install --save express pug body-parser mongodb getenv
npm install --save-dev eslint nodemon
npx eslint --init
echo "node_modules/" >> .gitignore
git add .
git commit -m "Initial setup"
git push -u origin master
```

## Sign up and login

Sign up via a form and log in with a username and password. I am using the users email address as password. This is because the email address is unique and rarely changes.

```sh
npm install --save passport passport-local connect-flash cookie-parser express-session bcrypt
touch views/pages/signup.pug
touch views/pages/login.pug
touch views/pages/protected.pug
touch public/stylesheets/login.css
mkdir lib
touch lib/mongoClient.js
touch lib/localAuthStrategy.js
```

Tell Passport how to authenticate a user by creating a LocalStrategy. See lib/localAuth.js.

Set up the routing to the sign up and login pages.

```js
```
