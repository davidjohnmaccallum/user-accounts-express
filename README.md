# User Accounts with ExpressJS

Almost every app I build needs to manage user accounts: Sign up users, login users, let users update their profiles, password reset, user permissions, control access to resources based on permissions and on resource ownership. In this project I attempt a best practice implementation using [Passport](http://www.passportjs.org/).

## Initial setup

Create an ExpressJS app.

```sh
mkdir user-accounts-express
cd user-accounts-express
touch README.md
touch index.js
mkdir views
mkdir views/includes
mkdir views/pages
touch views/pages/index.pug
touch views/pages/404.pug
touch views/pages/500.pug
mkdir public
mkdir public/stylesheets
mkdir public/stylesheets/main.css
git init
git remote add origin https://github.com/davidjohnmaccallum/user-accounts-express.git
npm init -y
npm install --save express pug body-parser mongodb
npm install --save-dev eslint nodemon
npx eslint --init
echo "node_modules/" >> .gitignore
git add .
git commit -m "Initial setup"
git push -u origin master
```

## Sign up and login

Sign up via a form and log in with a username and password.

```sh
touch views/pages/signup.pug
touch views/pages/login.pug
```
