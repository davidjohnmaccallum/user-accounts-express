# User Accounts with ExpressJS

Almost every app I build needs to manage user accounts. Onboarding users, authenticating users, letting users update their profiles, reset their password when the user forets it, grant the user permissions, control access to resources based on permissions and on resource ownership. In this project I attempt a best practice implementation using [Passport](http://www.passportjs.org/).

## Initial setup

```sh
mkdir user-accounts-express
cd user-accounts-express
touch README.md
touch index.js
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
