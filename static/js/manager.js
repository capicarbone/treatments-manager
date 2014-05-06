
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
	.when('/tratamiento/accion/:action_key',{
		controller: 'TreatmentActionDetailCtrl',
		templateUrl:'template/action_details.html'
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
	    		console.log(e);
	    		$scope.patient.birthday = moment(e.date).format();
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

	$scope.diaryFulfillments = {};

	$scope.setupChart = function (){
		console.log("Charts Loaded");

		var data = google.visualization.arrayToDataTable($scope.diary_fulfillments_chartdata, false);

		var container = document.getElementById('diary_fulfillment_chart');

		var options = {			
			'width': container.offsetWidth,
			'height': 300,
			'pointSize': 5,
			'vAxis':{
				'title': '% Cumplimiento',
				'maxValue': 100,
				'minValue': 0
			},
			'hAxis':{
				'title': 'Días'
			},
			'animation':{
				'duration': 1000,				
			},
			'legend': {
				'position': 'none'
			}
		};

		var chart = new google.visualization.LineChart(container);
		chart.draw(data, options);

		var actions = $scope.treatment.actions;

		for (var i = actions.length - 1; i >= 0; i--) {
			var action = actions[i];

			if ( action.isForMeasurement ){
				container = document.getElementById(action.id);
				var plain_data = [['Dia','Valor']];

				if (action.measurement.chart_data.points && action.measurement.chart_data.points.length > 0){
					for (var j = action.measurement.chart_data.points.length - 1; j >= 0; j--) {
						data_point = action.measurement.chart_data.points[j];

						plain_data[j+1] = [];
						plain_data[j+1][0] = Date(data_point.tag);
						plain_data[j+1][1] = data_point.value;
					};				

					var data = google.visualization.arrayToDataTable(plain_data, false);	

					var options = {
						'width': container.offsetWidth,
						'height': 130,		
						'pointSize': 4,
						'axisTitlesPosition': 'none',
						'hAxis': {
							'textStyle': 'none',
							'viewWindowMode': 'maximized',
							'textPosition': 'none'
						},
						'vAxis': {
							'textStyle': 'none',
							'viewWindowMode': 'pretty'
						},
						'legend': {'position': 'none'}
					}

					var chart = new google.visualization.LineChart(container);
					chart.draw(data, options);	
				}			
				
			}
			
		};

	}

	$scope.init = function(){

		var treatment_key = $routeParams.treatment_key

		$rootScope.api.treatment.details({ekey: treatment_key}).execute(function(response){

			$scope.treatment = new Treatment(response.treatment);
			$scope.patient = new Patient(response.patient);

			var actions = $scope.treatment.actions;

			for (i = 0; i < actions.length; i++){
				$scope.treatment.actions[i] = new TreatmentAction(actions[i]);
			}

			$scope.$apply();

			$rootScope.api.treatment.diary_fulfillments({ekey: treatment_key}).execute(function(response){			

				if (!angular.isUndefined(response) && !angular.isUndefined(response.diary_fulfillments)){
					var diary_fulfillments_chartdata = [['Dia', 'Cumplimiento']];

					$scope.diaryFulfillments = response.diary_fulfillments;

					for (var i = response.diary_fulfillments.length - 1; i >= 0; i--) {

						response.diary_fulfillments[i] = new DiaryFulfillment(response.diary_fulfillments[i]);
						var diary_fulfillment = response.diary_fulfillments[i];
						var data_point = []

						data_point[0] = moment(diary_fulfillment.day).toDate();
						data_point[1] = diary_fulfillment.general_porcentage;

						diary_fulfillments_chartdata[i+1] = data_point;

					};

					$scope.diary_fulfillments_chartdata = diary_fulfillments_chartdata;

					$scope.$apply();

					google.load('visualization', '1.0', {'packages':['corechart'], 'language': 'es', 'callback': $scope.setupChart });	
				}				
			});		
		});
	}

	$scope.init()

})

.controller('TreatmentActionDetailCtrl', function($scope, $rootScope){


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
	$scope.measurement_take_form_fl = false;

	$scope.isFormActive = function(){
		return $scope.medicament_take_form_fl || $scope.measurement_take_form_fl;
	}

	$scope.init = function(){

		$rootScope.api.medicaments.all().execute(function(res){

			$scope.medicaments = res.medicaments;
			$scope.$apply();
		});

		$("#take_time_picker").datetimepicker({
			language: 'en',
			minuteStepping: 5,
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
		$scope.measurement_take_form_fl = false;

	}

	$scope.measurement_take_form = function(){
		$scope.medicament_take_form_fl = false;
		$scope.measurement_take_form_fl = true;
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

	$scope.register_action = function(){

		var action = {}

		if ($scope.medicament_take_form_fl )
			$scope.action.action_type = 'M';

		if ($scope.measurement_take_form_fl )
			$scope.action.action_type = 'I';

		if ( $scope.valid_action() ){

			angular.copy($scope.action, action);

			action.readable_take_hour = $scope.action.readable_take_hour;

			$scope.actions.push(action);			

			delete $scope.action.medicament;
			$scope.action.take_hour = "";
			$scope.form.take_hour = "";
			$scope.action.readable_take_hour = "";

			$scope.cancel();

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

	$scope.cancel = function(){
		$scope.medicament_take_form_fl = false;
		$scope.measurement_take_form_fl = false;
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

	moment.lang('es');

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


