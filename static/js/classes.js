
function DiaryFulfillment(DiaryFulfillmentData){

	var diary_fulfillment = DiaryFulfillmentData;

	diary_fulfillment.day_readable = function(){

		return moment(diary_fulfillment.day).format("dddd DD [de] MMMM [de] YYYY").capitalize();
	}

	diary_fulfillment.general_porcentage = (diary_fulfillment.made_actions / diary_fulfillment.total_actions)*100;

	return diary_fulfillment;
}

function TreatmentAction (treatment_action_data) {
	
	var treatment_action = treatment_action_data;

	treatment_action.take_hour_readable = moment(treatment_action.take_hour, "hh:mm:ss").format("h:mm a").toUpperCase();

	treatment_action.description = function(){

		return "Todos los dias a las " + treatment_action.take_hour_readable;
	}

	treatment_action.isForMedicamentTake = treatment_action.action_type == 'M';

	treatment_action.isForMeasurement = treatment_action.action_type == 'I';

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

	patient.person.gender_readable = patient.GENDERS[patient.person.gender] 

	return patient;
}

