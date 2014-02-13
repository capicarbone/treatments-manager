
angular.module('logic', ['ngRoute'])

.config(function($routeProvider){

	$routeProvider.when('/doctors', {
		controller: 'doctorsManagerCtrl',
		templateUrl: 'doctors_manager'
	})
	.when('/',{
		controller: 'adminDashboardCtrl',
		templateUrl: 'admin_dashboard'
	})
	.otherwise({
		redirectTo: '/'
	});
})

.controller('doctorsManagerCtrl', function($scope){

	$scope.title = 'Doctores';
})

.controller('adminDashboardCtrl', function($scope){
	$scope.title = 'Dashboard';
});

