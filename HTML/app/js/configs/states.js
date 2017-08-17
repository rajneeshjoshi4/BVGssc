/**
        Setting up the States by using angular UI routes
**/
module.exports = function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('login');

  $stateProvider
  // ROOT STATES for header and sidebar ========================================
    .state('root', {
    url: '',
    abstract: true,
    views: {
      'header': {
        templateUrl: 'view/templates/header.html',
        /*controller: 'HeaderCtrl'*/
      }
    }
  })

  // LOGIN STATE ========================================
  .state('root.login', {
    url: '/login',
    views: {
      'content@': {
        templateUrl: 'view/login.html'
      }
    }
  })

  // HOME STATE ========================================
  .state('root.home', {
    url: '/home',
    views: {
      'content@': {
        templateUrl: 'view/home.html'
      }
    }
  })
};

/*To resolve ng-annotate issue in case of minify the JS*/
module.exports.$inject = ['$stateProvider', '$urlRouterProvider'];