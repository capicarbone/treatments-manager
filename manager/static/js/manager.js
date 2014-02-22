
angular.module('logic', ['ngRoute'])

.config(function($routeProvider){

	$routeProvider
	.when('/',{
		controller:'DoctorDashboardCtrl',
		templateUrl:'template/doctor_dashboard.html'
	})

	// Patients Routes
	.when('/pacientes', {
		controller:'PatientsManagerCtrl',
		templateUrl:'template/patients_manager.html'
	})
	.when('/paciente/form', {
		controller:'PatientFormCtrl',
		templateUrl:'template/patient_form.html'
	})

	// Treatments Routes
	.when('/tratamientos',{
		controller: 'TreatmentsManagerCtrl',
		templateUrl:'template/treatments_manager.html'
	})
	.when('/paciente/:patient_key/tratamiento/form',{
		controller: 'TreatmentFormCtrl',
		templateUrl:'template/treatment_form.html'
	})

	// Medicaments Routes

	.when('/medicamentos',{
		controller: 'MedicamentsManagerCtrl',
		templateUrl:'template/medicaments_manager.html'
	})
	.when('/medicamento/form',{
		controller: 'MedicamentFormCtrl',
		templateUrl:'template/medicament_form.html'
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

	$rootScope.section_title = "Registro de Paciente";

	$scope.blood_types = ['ORH+', 'ORH-',' B+','A+', 'B-', 'A-' ];

	$scope.genders = [
		{key: 'M', value:'Masculino'},
		{key: 'F', value:'Femenino'}
	];

	$scope.patient = {};

	$scope.init_birthday_field = function(){

		console.log("Ejecutado");

	    $(".input-group.date").datepicker({
	    	format: "yyyy-mm-ddT00:00:00.00Z",
    		language: "es",
    		startView: 'decade'
	    })
	    .on('changeDate', function(e){

	    	$scope.$apply(function(){
	    		$scope.patient.birthday = e.format();
	    	})
	    })
	  
	}

	$scope.savePatient = function(){	

		var patient = $scope.patient

		patient.person.gender = patient.person.gender.key;	
		patient.doctor_key = $rootScope.doctor_key;

		$rootScope.api.patient.save(patient).execute(function(res){
			console.log(res);	
			
			$location.path('/paciente/'+ res.key +'/tratamiento/form').replace();
			$scope.$apply();


		});

	}

	$scope.init_birthday_field();
})


.controller('TreatmentsManagerCtrl', function($scope, $rootScope){

	$rootScope.section_title = "Tratamientos activos"

})

.controller('TreatmentFormCtrl', function($scope, $rootScope, $routeParams){

	$rootScope.section_title = "Registro de tratamiento"
	
	$scope.medicaments = []	

	$scope.add_medicament_take = function(){

		$scope.medicaments.push({text: 'hola'});
	}	

})

.controller('MedicamentsManagerCtrl', function($scope, $rootScope){

	$rootScope.section_title = "Medicamentos"

})

.controller('MedicamentFormCtrl', function($scope, $rootScope){

	$rootScope.section_title = "Registro de medicamento"

	$scope.presentations = []

	$scope.init = function(){

		$rootScope.api.presentations.all().execute(function(res){

			$scope.presentations = res.presentations;
			$scope.$apply()

		});
	}

	$scope.save = function(){

		medicament = $scope.medicament;	

		medicament.registered_by = $rootScope.doctor_key;

		$rootScope.api.medicament.save(medicament).execute(function(res){

			console.log(res);
		})
	}

	$scope.init();

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

		$rootScope.$apply(function(){
			$rootScope.doctor_key = document.getElementById('doctor_key').value
		})
	};

	$rootScope.load_endpoints = function(){

		var host = window.location.host;
		var API_ROOT = '//' + host + '/_ah/api';

		gapi.client.load('doctor', 'v1', function(){
			$rootScope.is_backend_ready = true;
			$rootScope.$apply();

			$rootScope.api = gapi.client.doctor;

		}, API_ROOT)
	};
});

init_app = function(){
	
	window.init();	
		
}


