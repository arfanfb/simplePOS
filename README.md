# SIMPLE POS REACT

This is main repository for personal project, this repository contain service for personal application.

## Requirement

Technology that used in this application is

* Node.js
* npm
* express
* react.js
* gulp
* sass
* redis
* mongodb

## Setup

* Copy .env.example to .env
* You need to install all of package that used on this project with command `npm install`
* You need to run app with command `npm start` or `NODE_ENV=production node node_modules/.bin/babel-node --presets 'es2015' build/src/server.js` on your terminal machine.
* After your app is ready, you can access it from [http://localhost:8080](http://localhost:8080).
* You can change port on .env
* If you need compile expressjs files, you can compile it with command `gulp babelify-server and gulp babelify-routes`.
* If you need compile model mongodb, you can compile it with command `gulp babelify-model`
* If you need compile react.js files, you can compile it with command `gulp babelify-react`
* If you need compile sass files, you can compile it with command `gulp sass`
* If you dont have gulp, you can install based on [gulp repository](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md).


## License

This application is built on top of express, but UI/UX design is strictly confidential just for internal use at personal projects.

##

@2018
