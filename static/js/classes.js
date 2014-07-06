
function DiaryFulfillment(DiaryFulfillmentData){

	var diary_fulfillment = DiaryFulfillmentData;

	diary_fulfillment.day_readable = function(){

		return moment(diary_fulfillment.day).format("dddd DD [de] MMMM [de] YYYY").capitalize();
	}

	diary_fulfillment.general_porcentage = (diary_fulfillment.made_actions / diary_fulfillment.total_actions)*100;

	return diary_fulfillment;
}

function Fulfillment(fulfillment_data){

	var fulfillment = fulfillment_data;

	fulfillment.DECISIONS = {
		'T': 'Realizado',
		'N': 'No realizado',
		'P': 'Postergado'
	}

	fulfillment.realized = function(){
		return fulfillment.decision == 'T';
	}

	fulfillment.day_readable = moment(fulfillment.for_moment).format("DD/MM/YY")

	fulfillment.realization_time = moment(fulfillment.for_moment).format("hh:mm a");

	if (fulfillment.realized()){
		fulfillment.realized_time = moment(fulfillment.action_moment).format("hh:mm a");
		fulfillment.difference_time = moment(fulfillment.for_moment).from(fulfillment.action_moment, true);	
	}else{
		fulfillment.realized_time = '--';
		fulfillment.difference_time = '--';
		fulfillment.value = '--';
	}
	
	return fulfillment;
}

function Measurement(measurement_data, fulfillments){

	var measurement = measurement_data;
	measurement.fulfillments = fulfillments;

	if (fulfillments)
		for (var i = measurement.fulfillments.length - 1; i >= 0; i--) {			
			measurement.fulfillments[i].value = measurement.fulfillments[i].value*1;
		}	

	measurement.highter_record = function(){

		var highter_value = 0;

		for (var i = measurement.fulfillments.length - 1; i >= 0; i--) {
			if ( measurement.fulfillments[i].value > highter_value)
				highter_value = measurement.fulfillments[i].value;
		}	

		return highter_value;
	}

	measurement.lowest_record = function(){

		var lowest_value = measurement.fulfillments[0].value;

		for (var i = measurement.fulfillments.length - 1; i >= 1; i--) {
			if ( measurement.fulfillments[i].value < lowest_value)
				lowest_value = measurement.fulfillments[i].value;
		}	

		return lowest_value;
	}

	measurement.average= function(){

		var sum = 0;
		var totals = measurement.fulfillments.length;

		for (var i = totals - 1; i >= 0; i--) {	

			if (measurement.fulfillments[i].realized())		
				sum = sum + measurement.fulfillments[i].value*1;
			else
				totals = totals - 1;
		}		

		return sum / totals;
	}

	return measurement;
}

function TreatmentAction (treatment_action_data) {
	
	var treatment_action = treatment_action_data;

	treatment_action.take_hour_readable = moment(treatment_action.take_hour, "hh:mm:ss").format("h:mm a").toUpperCase();

	treatment_action.description = function(){

		return "Todos los dias a las " + treatment_action.take_hour_readable;
	}

	treatment_action.isForMedicamentTake = treatment_action.action_type == 'M';

	treatment_action.isForMeasurement = treatment_action.action_type == 'I';

	if (treatment_action.isForMeasurement){
		treatment_action.measurement = new Measurement(treatment_action.measurement, treatment_action.fulfillments);
	}

	if (treatment_action.fulfillments){

		var fulfillments = [];

		for (var i = treatment_action.fulfillments.length - 1; i >= 0; i--) {

			fulfillments[i] = new Fulfillment(treatment_action.fulfillments[i]);
		};

		treatment_action.fulfillments = fulfillments;
	}

	treatment_action.regimeIsTimeInterval = treatment_action.regime_type ==	 Consts.TreatmentAction.regimeTypes.TIME_INTERVAL

	return treatment_action;

}

function Treatment(treatment_data){

	var treatment  = treatment_data;

	treatment.created_at_readable = function(){
		return moment(treatment.created_at).format("l");
	}

	treatment.init_date_readable = function(){
		return moment(treatment.init_date).format("dddd DD [de] MMMM [de] YYYY").capitalize();
	}

	treatment.init_date_readable_short = function(){
		return moment(treatment.init_date).format("DD/MM/YY")
	}

	treatment.last_report_time_readable = function(){
		return moment(treatment.last_report_time).format("DD / MM / YY [a las] H:mm A");
	}

	treatment.objetives = Utils.messageForBlank(treatment.objetives);

	return treatment;
}

function Patient(patient_data){	

	var patient = patient_data;

	patient.GENDERS = {
		'M': 'Masculino',
		'F': 'Femenino',
		'N': 'No especificado'
	}

	patient.birthday_readable = moment(patient.birthday).format("l");
	patient.age = moment(patient.birthday).fromNow(true);

	patient.allergies = Utils.messageForBlank(patient.allergies);

	patient.person.gender_readable = patient.GENDERS[patient.person.gender];

	patient.person.short_name = function(){
		var first_name = patient.person.first_name.split(" ")[0];
		var last_name = patient.person.last_name.split(" ")[0];

		return first_name + " " + last_name;
	}

	return patient;
}

