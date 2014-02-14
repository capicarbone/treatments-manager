
angular.module('logic', ['ngRoute'])

.config(function($routeProvider){

	$routeProvider
	.when('/',{
		controller:'adminDashboardCtrl',
		templateUrl:'admin_dashboard.html'
	})
	.when('/doctors', {
		controller:'doctorsManagerCtrl',
		templateUrl:'doctors_manager.html'
	})
	.when('/doctor/form',{
		controller: 'doctorFormCtrl',
		templateUrl: 'doctor_form.html'
	})
	.otherwise({
		redirectTo: '/'
	});
})

.controller('doctorsManagerCtrl', function($scope){

	$scope.title = 'Doctores';

})

.controller('doctorFormCtrl', function($scope){

	$scope.specialities = [
		{name:'Dermatólogo', 'descripcion': '', id: "dermatologo"},
		{name:'Cardiólogo', 'descripcion': '', id:"cardiologo"},
		{name:'Médico Internista', 'descripcion': '', id:"internista"},
	];

	$scope.genders = [
		{key: 'M', value:'Masculino'},
		{key: 'F', value:'Femenino'}
	]


	$scope.saveDoctor = function(){
		var ng_doctor = $scope.doctor;

		var doctor = {}
		doctor.person_data = ng_doctor.person_data;
		doctor.email = ng_doctor.email;
		doctor.specialities = [];
		
		/*angular.forEach(ng_doctor.specialities, function(spe){
			doctor.specialities.push(spe.id);
		});*/

		ng_doctor.specialities = [];
		ng_doctor.person_data.gender = 'M';

		console.log(ng_doctor);

		gapi.client.admin.doctor.save(ng_doctor)
		.execute(function(response){
			console.log(response);
		})
	}
})

.controller('adminDashboardCtrl', function($scope, $window){

	$scope.title = 'Dashboard';

	$window.init= function(){
		$scope.$apply($scope.load_endpoints);
	};

	$scope.load_endpoints = function(){

		var host = window.location.host;
		var API_ROOT = '//' + host + '/_ah/api';

		gapi.client.load('admin', 'v1', function(){
			$scope.is_backend_ready = true;

		}, API_ROOT)
	};

});

function init_app(){
	window.init();
}

