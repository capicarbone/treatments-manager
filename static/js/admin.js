
angular.module('logic', ['ngRoute', 'tmComponents'])

.config(function($routeProvider){

	$routeProvider
	.when('/',{
		controller:'adminDashboardCtrl',
		templateUrl:'template/admin_dashboard.html'
	})
	.when('/doctors', {
		controller:'doctorsManagerCtrl',
		templateUrl:'template/doctors_manager.html'
	})
	.when('/doctor/form',{
		controller: 'doctorFormCtrl',
		templateUrl:'template/doctor_form.html'
	})
	.otherwise({
		redirectTo: '/'
	});
})

.controller('doctorsManagerCtrl', function($scope, $rootScope){

	$rootScope.section_title = "Doctores";	

})

.controller('doctorFormCtrl', function($scope, $location, $rootScope){

	$rootScope.section_title = "Registro de doctor"
	$scope.specialities = [];


	$scope.init = function(){
		gapi.client.admin.specialities.all().execute(
			function(response){
				$scope.specialities = response.specialities;
				$scope.$apply();
			}
		);		
	};

	$scope.genders = [
		{key: 'M', value:'Masculino'},
		{key: 'F', value:'Femenino'}
	];


	$scope.saveDoctor = function(){

		if ($scope.form.$valid){
			var ng_doctor = $scope.doctor;			

			var doctor = {}
			doctor.person = ng_doctor.person;
			doctor.email = ng_doctor.email;					

			doctor.specialities = ng_doctor.specialities;

			if (ng_doctor.person.gender)
				doctor.person.gender = ng_doctor.person.gender.key;
			else
				doctor.person.gender = 'N';

			console.log(doctor);

			gapi.client.admin.doctor.save(doctor)
			.execute(function(response){			
				$location.path('/doctors').replace();
				$scope.$apply()
				console.log(response);

			});	
		}else
			console.log("No es válido");
		
	}

	$scope.init()
})

.controller('adminDashboardCtrl', function($scope, $rootScope){

	$rootScope.section_title = "Dashboard";	

})

.run(function($rootScope, $window, $location){
	console.log("Se ejecutó");
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

		
		var API_ROOT = complete_api_url('/_ah/api');
		
		gapi.client.load('admin', 'v1', function(){
			$rootScope.is_backend_ready = true;
			$rootScope.$apply();

		}, API_ROOT)
	};
});

init_app = function(){
	window.init();
}

