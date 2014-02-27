'''
Created on 27/02/2014

@author: capi
'''

import endpoints
from google.appengine.ext import ndb
from manager.models import Patient, Treatment, Medicament
from manager.api import treatments_messages
from manager.api.treatments_messages import MappedObjectMsg, EntireTreatment
from protorpc import remote, message_types, messages

@endpoints.api(name="patient", version="v1",
               description="API for patients clients.")
class ForPatientApi(remote.Service):

    CODE_CONTAINER = endpoints.ResourceContainer(code=messages.StringField(2))

    @endpoints.method(CODE_CONTAINER, treatments_messages.EntireTreatment,
                      path="treatment", http_method="GET", name="treatment.get")
    def treatment(self, request):

        treatment = Treatment.by_code(request.code)
        patient = treatment.key.parent().get()
        doctor = patient.key.parent().get()


        entire_msg = EntireTreatment()
        treatment_msg = treatment.to_message()
        actions_msgs = treatment.get_actions_messages()
        treatment_msg.actions = actions_msgs

        entire_msg.treatment = treatment_msg
        entire_msg.doctor = doctor.to_message()
        entire_msg.patient = patient.to_message()

        return entire_msg
