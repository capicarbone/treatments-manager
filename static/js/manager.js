
angular.module('logic', ['ngRoute', 'tmComponents'])

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
	.when('/paciente/:patient_id/tratamiento/form',{
		controller: 'TreatmentFormCtrl',
		templateUrl:'template/treatment_form.html'
	})
	.when('/tratamiento/:treatment_key',{
		controller: 'TreatmentDetailCtrl',
		templateUrl:'template/treatment_details.html'
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


	$rootScope.section_title = "Dashboard"
})

.controller('PatientsManagerCtrl', function($scope, $location, $rootScope){

	$rootScope.section_title = "Mis Pacientes"

	$scope.patients = []

	$scope.init = function(){

		$('.dropdown-toggle').dropdown();

		$rootScope.api.patients.all({ekey: $rootScope.doctor_key})
		.execute( function(res){
			$scope.$apply(function(){
				console.log(res);
				$scope.patients = res.patients;
			})
		});
	};

	$scope.init()

})

.controller('PatientFormCtrl', function($scope, $location, $rootScope){

	var birthday_format = "dd / mm / yyyy";

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
	    	format: birthday_format,
	    	endDate: moment(new Date()).format(birthday_format.toUpperCase()),
    		language: "es",
    		startView: 'decade',
    		autoclose: true
	    })
	    .on('changeDate', function(e){

	    	$scope.$apply(function(){
	    		$scope.patient.readable_birthday = e.format();
	    		$scope.patient.birthday = moment(e).format();
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
			patient.id = res.id;
			$rootScope.patient = patient;

			$location.path('/paciente/'+ res.id +'/tratamiento/form').replace();
			$scope.$apply();


		});

	}

	$scope.init_birthday_field();
})


.controller('TreatmentsManagerCtrl', function($scope, $rootScope){

	$rootScope.section_title = "Tratamientos activos"

	$scope.treatments = [];

	$scope.init = function(){

		$rootScope.api.treatments.all({ekey: $rootScope.doctor_key}).execute(function(response){

			$scope.$apply(function(){
				
				angular.forEach(response.treatments, function(t){
					t.created_at_readable = moment(t.created_at).format("DD / MM / YY");
					
				});

				$scope.treatments = response.treatments;
			});

		});
	}

	$scope.init()

})

.controller('TreatmentDetailCtrl', function($scope, $rootScope, $routeParams){

	$rootScope.section_title = "Tratamiento"

	$scope.treatment = {}
	$scope.patient = {}

	$scope.init = function(){

		var treatment_key = $routeParams.treatment_key

		$rootScope.api.treatment.details({ekey: treatment_key}).execute(function(response){

			$scope.treatment = response.treatment;
			$scope.patient = response.patient;

			var actions = $scope.treatment.actions;

			for (i = 0; i < actions.length; i++)
				actions[i].readable_take_hour = moment(actions[i].take_hour, "hh:mm").format("hh:mm a").toUpperCase();

			$scope.$apply();
		});
	}

	$scope.init()

})

// ######## Treatment Form Controller ########

.controller('TreatmentFormCtrl', function($scope, $rootScope, $routeParams, $location){

	$rootScope.section_title = "Registro de tratamiento"

	$scope.patient = $rootScope.patient;
	$scope.treatment = {is_active: true};

	$scope.medicaments = []

	$scope.action = {}
	$scope.action.regime_type = 'E';

	$scope.actions = []


	$scope.medicament_take_form_fl = false;

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

				if ( moment_date.isValid() )
					$scope.action.take_hour = moment_date.format();
				else
					$scope.action.take_hour = undefined;

			});

		})

	}	

	$scope.specific_hour_selected = function(){
		return $scope.action.regime_type == 'E';
	}


	$scope.medicament_take_form = function(){
		$scope.medicament_take_form_fl = true;
	}

	$scope.valid_action = function(){

		if ( $scope.action.action_type == 'M' ){

			if ( !$scope.action.medicament || $scope.action_type == "")
				return false;

			if ( $scope.action.regime_type == 'E')
				if ( !$scope.action.take_hour || $scope.action.take_hour == "")
					return false
		}

		return true;
	}

	$scope.register_medicament = function(){

		var action = {}
		$scope.action.action_type = 'M';

		if ( $scope.valid_action() ){

			action.action_type = $scope.action.action_type;			
			action.medicament = $scope.action.medicament;
			action.regime_type = $scope.action.regime_type;
			action.take_hour = $scope.action.take_hour;
			action.readable_take_hour = $scope.action.readable_take_hour;

			$scope.actions.push(action);

			$scope.medicament_take_form_fl = false;

			$scope.action.medicament = "";
			$scope.action.take_hour = "";
			$scope.form.take_hour = "";
			$scope.action.readable_take_hour = "";

			$action = {};

		}

		

	}

	$scope.treatment_save = function(){

		var treatment = $scope.treatment;
		treatment.actions = $scope.actions;
		treatment.patient_key = $scope.patient.key;

		$rootScope.api.treatment.save(treatment).execute(function(res){
			console.log(res);
			treatment_id = res.id;

			$location.path('tratamiento/' + res.key).replace();
			$scope.$apply();

		});
	}

	$scope.delete_action = function(index){

		$scope.actions.pop(index);
		console.log("Hola");

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


