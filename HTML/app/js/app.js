// required function will pull all js files from node-module folders by using browserify, that has been defined in gulp
var angular = require('angular');
var angularStrap = require('angular-strap');
var ngAnimate = require('angular-animate');
var uiRouter = require('angular-ui-router');


angular.module('myApp', ['ngAnimate', 'mgcrea.ngStrap', 'ui.router']);

/**
Here's the calling order:
(1) app.config()
(2) app.run()
(3) directive's compile functions (if they are found in the dom)
(4) app.controller()
(5) directive's link functions (again, if found)
**/

// one require statement per sub directory instead of one per file
//require('./controllers');
require('./configs');
require('./runs');