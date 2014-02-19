
angular.module('logic', ['ngRoute'])

.config(function($routeProvider){

	$routeProvider
	.when('/',{
		controller:'DoctorDashboardCtrl',
		templateUrl:'template/doctor_dashboard.html'
	})
	.when('/pacientes', {
		controller:'PatientsManagerCtrl',
		templateUrl:'template/patients_manager.html'
	})
	.when('/paciente/form', {
		controller:'PatientFormCtrl',
		templateUrl:'template/patient_form.html'
	})
	.when('/tratamientos',{
		controller: 'TreatmentsManagerCtrl',
		templateUrl:'template/treatments_manager.html'
	})
	.otherwise({
		redirectTo: '/'
	});
})

.controller('DoctorDashboardCtrl', function($scope, $rootScope){

	
	$rootScope.section_title = "Inicio"
})

.controller('PatientsManagerCtrl', function($scope, $location, $rootScope){

	$rootScope.section_title = "Mis Pacientes"
})

.controller('PatientFormCtrl', function($scope, $location, $rootScope){

	$rootScope.section_title = "Registro de Paciente"
})


.controller('TreatmentsManagerCtrl', function($scope, $rootScope){

	$rootScope.section_title = "Tratamientos activos"

})

.run(function($rootScope, $window, $location){
	
	$rootScope.is_backend_ready = false;
	$rootScope.section_title = 'Inicio';

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

