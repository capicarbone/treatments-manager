'''
Created on 14/02/2014

@author: Capi
'''

import endpoints
from manager.models import Patient
from manager.api import treatments_messages
from protorpc import remote, message_types

@endpoints.api(name="doctor", version="v1",
               description="API for doctor users.")
class ForDoctorApi(remote.Service):

    @endpoints.method(treatments_messages.PatientMsg, treatments_messages.PatientMsg,
                      path="patient", http_method="POST", name="patient.save")
    def patient_save(self, patient_msg):

        patient = Patient(message=patient_msg)
        patient.put()

        patient_msg.id = str(patient.key.id())

        return patient_msg




