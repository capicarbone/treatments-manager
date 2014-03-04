
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

	$scope.patients = []

	$scope.init = function(){

		$('.dropdown-toggle').dropdown();

		$rootScope.api.patients.all({key: $rootScope.doctor_key})
		.execute( function(res){
			$scope.$apply(function(){
				$scope.patients = res.result.patients;	
			})			
		});
	};

	$scope.init()

})

.controller('PatientFormCtrl', function($scope, $location, $rootScope){

	$rootScope.section_title = "Registro de Paciente";

	$scope.blood_types = ['ORH+', 'ORH-',' B+','A+', 'B-', 'A-' , 'AB+', 'AB-'];

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

			patient.key = res.key;
			$rootScope.patient = patient;
			
			$location.path('/paciente/'+ res.key +'/tratamiento/form').replace();
			$scope.$apply();


		});

	}

	$scope.init_birthday_field();
})


.controller('TreatmentsManagerCtrl', function($scope, $rootScope){

	$rootScope.section_title = "Tratamientos activos"

})

// ######## Treatment Form Controller ########

.controller('TreatmentFormCtrl', function($scope, $rootScope, $routeParams){

	$rootScope.section_title = "Registro de tratamiento"

	$scope.patient = $rootScope.patient;
	$scope.treatment = {is_active: true};

	$scope.init = function(){

		$rootScope.api.medicaments.all().execute(function(res){

			$scope.medicaments = res.medicaments;
			$scope.$apply();
		});

		$("#take_time_picker").datetimepicker({
			language: 'es',
			pickDate: false
		})
		.on('change.dp', function(e){
			$scope.$apply(function(){
				$scope.action.readable_take_hour = document.getElementById("take_hour").value			

				var moment_date = moment($scope.action.readable_take_hour, "hh:mm a");
				$scope.action.take_hour = Math.round( moment_date.toDate().getTime() / 1000	);
			});
			
		})

	}

	$scope.medicaments = []
	
	$scope.action = {}
	$scope.action.regime_type = 'E';

	$scope.actions = []	


	$scope.medicament_take_form_fl = false;
	
	$scope.specific_hour_selected = function(){
		return $scope.action.regime_type == 'E';
	}


	$scope.medicament_take_form = function(){
		$scope.medicament_take_form_fl = true;
	}	

	$scope.register_medicament = function(){

		var action = {}

		action.action_type = 'M';
		action.medicament = $scope.action.medicament;
		action.regime_type = $scope.action.regime_type;	
		action.take_hour = $scope.action.take_hour;
		action.readable_take_hour = $scope.action.readable_take_hour;

		$scope.actions.push(action);

		$scope.medicament_take_form_fl = false;

		$scope.action.medicament = "";
		$scope.action.take_hour = "";
		$scope.form.take_hour = "";

	}

	$scope.treatment_save = function(){

		var treatment = $scope.treatment;
		treatment.actions = $scope.actions;
		treatment.patient_key = $scope.patient.key;

		$rootScope.api.treatment.save(treatment).execute(function(res){
			console.log(res);
		});
	}

	$scope.init();

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

		
		//var API_ROOT = 'https://capicptest.appspot.com/_ah/api'
		var API_ROOT = complete_api_url('/_ah/api');

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


