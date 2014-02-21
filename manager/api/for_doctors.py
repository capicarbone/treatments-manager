'''
Created on 14/02/2014

@author: Capi
'''

import endpoints
from google.appengine.ext import ndb
from manager.models import Patient, Treatment
from manager.api import treatments_messages
from protorpc import remote, message_types

@endpoints.api(name="doctor", version="v1",
               description="API for doctor users.")
class ForDoctorApi(remote.Service):

    @endpoints.method(treatments_messages.PatientMsg, treatments_messages.PatientMsg,
                      path="patient", http_method="POST", name="patient.save")
    def patient_save(self, patient_msg):


        patient = Patient(message=patient_msg, parent=ndb.Key(urlsafe=patient_msg.doctor_key))
        patient.put()

        patient_msg.key = patient.key.urlsafe()

        return patient_msg

    @endpoints.method(treatments_messages.TreatmentMsg, treatments_messages.TreatmentMsg,
                      path="treatment", http_method="POST", name="treatment.save")
    def treatment_save(self,treatment_msg):

        treatment = Treatment(message=treatment_msg, parent=treatment_msg.patient_key)
        treatment.put()

        treatment_msg.key = treatment.key.urlsafe()

        return treatment_msg


