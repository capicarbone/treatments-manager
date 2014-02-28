# -*- coding:utf-8 -*-

'''
Created on 14/02/2014

@author: Capi
'''

import endpoints
from google.appengine.ext import ndb
from manager.models import *
from manager.api import treatments_messages
from manager.api.treatments_messages import MappedObjectMsg, EntireTreatment
from protorpc import remote, message_types, messages

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

        treatment = Treatment(message=treatment_msg, parent=ndb.Key(urlsafe=treatment_msg.patient_key))
        treatment.put()
        treatment.generate_code()
        treatment.is_active = True
        treatment.put()

        for a in treatment_msg.actions:

            action = TreatmentAction(message=a, parent=treatment.key)
            action.put()
            a.key = action.key.urlsafe()

        treatment_msg.key = treatment.key.urlsafe()

        return treatment_msg

    @endpoints.method(treatments_messages.MedicamentMsg, treatments_messages.MedicamentMsg,
                      path="medicament", http_method="POST", name="medicament.save")
    def medicament_save(self, medicament_msg):

        medicament = Medicament(message=medicament_msg)
        medicament.put()

        medicament_msg.key = medicament.key.urlsafe()

        return medicament_msg

    @endpoints.method(message_types.VoidMessage, treatments_messages.Presentations,
                      path="presentations", http_method="GET", name="presentations.all")
    def presentations(self, request):

        items = [
            MappedObjectMsg(description='Tabletas', for_db='t'),
            MappedObjectMsg(description='Cápsulas', for_db='t'),
            MappedObjectMsg(description='Jarabe', for_db='j'),
            MappedObjectMsg(description='Ampolla', for_db='a'),
            MappedObjectMsg(description='Inyección', for_db='i')
         ]

        return treatments_messages.Presentations(presentations=items)

    @endpoints.method(message_types.VoidMessage, treatments_messages.MedicamentsCollection,
                      path="medicaments", http_method="GET", name="medicaments.all")
    def medicaments(self, request):

        medicament_msgs = []

        medicaments = Medicament.query()

        for m in medicaments:
            medicament_msgs.append(m.to_message())

        return treatments_messages.MedicamentsCollection(medicaments=medicament_msgs)







