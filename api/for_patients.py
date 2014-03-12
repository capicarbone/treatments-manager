'''
Created on 27/02/2014

@author: capi
'''

import endpoints
from google.appengine.ext import ndb
from models import Patient, Treatment, Medicament, TreatmentAction, Fulfillment
from api import treatments_messages
from api.treatments_messages import MappedObjectMsg, EntireTreatment
from protorpc import remote, message_types, messages

@endpoints.api(name="patient", version="v1",
               description="API for patients clients.")
class ForPatients(remote.Service):

    CODE_CONTAINER = endpoints.ResourceContainer(code=messages.StringField(2))

    @endpoints.method(CODE_CONTAINER, treatments_messages.EntireTreatment,
                      path="treatment", http_method="GET", name="treatment.get")
    def treatment(self, request):

        treatment = Treatment.by_code(request.code)
        patient = treatment.key.parent().get()
        doctor = patient.key.parent().get()


        entire_msg = EntireTreatment()
        treatment_msg = treatment.to_message(ignore_fields=['patient_key'])
        actions_msgs = treatment.get_actions_messages(ignore_fields=['key', 'medicament__key'])
        treatment_msg.actions = actions_msgs

        entire_msg.treatment = treatment_msg
        entire_msg.doctor = doctor.to_message(ignore_fields=['key'])
        entire_msg.patient = patient.to_message(ignore_fields=['key','doctor_key'])

        return entire_msg

    @endpoints.method(treatments_messages.ReportFulfillmentMsg, message_types.VoidMessage,
                      path="treatment/report", http_method="POST", name="treatment.report")
    def report_treatment(self, report):

        for f in report.fulfillments:

            action_key = ndb.Key(TreatmentAction, f.action_id, parent=ndb.Key(urlsafe=report.treatment_key))

            fulfillment = Fulfillment(message=f, parent=action_key)
            fulfillment.put()

        return message_types.VoidMessage()



