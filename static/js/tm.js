
angular.module('TreatmentsManager', ['ngRoute', 'tmComponents'])

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
	.when('/paciente/:patient_key', {
		controller: 'PatientDetailsCtrl',
		templateUrl: 'template/patient_details.html'
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

			$rootScope.$broadcast('is_backend_ready');

		}, API_ROOT)
	};
});

init_app = function(){
	
	window.init();	

}


