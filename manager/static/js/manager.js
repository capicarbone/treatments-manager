
angular.module('logic', ['ngRoute'])

.config(function($routeProvider){

	$routeProvider
	.when('/',{
		controller:'DoctorDashboardCtrl',
		templateUrl:'doctor_dashboard.html'
	})
	.when('/pacientes', {
		controller:'PatientsManagerCtrl',
		templateUrl:'patients_manager.html'
	})
	.when('/tratamientos',{
		controller: 'TreatmentsManagerCtrl',
		templateUrl: 'treatments_manager.html'
	})
	.otherwise({
		redirectTo: '/'
	});
})

.controller('DoctorDashboardCtrl', function($scope){

	

})

.controller('PatientsManagerCtrl', function($scope, $location){

})

.controller('TreatmentsManagerCtrl', function($scope){

	

})

.run(function($rootScope, $window, $location){
	
	$rootScope.is_backend_ready = false;

	if ($location.path() != '/' ){
		$location.path('/');
		$rootScope.$apply();
	}

	$window.init= function(){
		console.log("Se ejecutó init");
		$rootScope.$apply($rootScope.load_endpoints);
	};

	$rootScope.load_endpoints = function(){

		var host = window.location.host;
		var API_ROOT = '//' + host + '/_ah/api';

		gapi.client.load('doctor', 'v1', function(){
			$rootScope.is_backend_ready = true;
			$rootScope.$apply();

		}, API_ROOT)
	};
});

init_app = function(){
	window.init();
}

