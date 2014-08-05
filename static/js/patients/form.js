
angular.module('TreatmentsManager')
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