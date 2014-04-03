# -*- coding:utf-8 -*-

'''
Created on 14/02/2014

@author: Capi
'''

import endpoints
from google.appengine.ext import ndb
from models import *
from api import treatments_messages
from api.treatments_messages import MappedObjectMsg, EntireTreatment,\
    TreatmentsCollection
from protorpc import remote, message_types, messages

@endpoints.api(name="doctor", version="v1",
               description="API for doctor users.")
class ForDoctors(remote.Service):

    # Resource Containers

    KEY_CONTAINER = endpoints.ResourceContainer(ekey=messages.StringField(1))
    ID_CONTAINER = endpoints.ResourceContainer(id=messages.StringField(1))

    @endpoints.method(treatments_messages.PatientMsg, treatments_messages.PatientMsg,
                      path="patient", http_method="POST", name="patient.save")
    def patient_save(self, patient_msg):

        patient = Patient(message=patient_msg, parent=ndb.Key(urlsafe=patient_msg.doctor_key))
        patient.put()

        patient_msg = patient.to_message(ignore_fields=('doctor_key',))

        return patient_msg



    # --------------- Treatments ---------------

    @endpoints.method(treatments_messages.TreatmentMsg, treatments_messages.TreatmentMsg,
                      path="treatment", http_method="POST", name="treatment.save")
    def treatment_save(self,treatment_msg):

        treatment = Treatment(message=treatment_msg, parent=ndb.Key(urlsafe=treatment_msg.patient_key))
        treatment.put()
        treatment.generate_code()
        treatment.is_active = True
        treatment.made_actions_count = 0
        treatment.past_actions_count = 0
        treatment.put()

        for a in treatment_msg.actions:

            action = TreatmentAction(message=a, parent=treatment.key)
            action.made_count = 0
            action.past_count = 0
            action.put()
            a.key = action.key.urlsafe()

        treatment_msg = treatment.to_message()

        return treatment_msg

    @endpoints.method(KEY_CONTAINER, treatments_messages.EntireTreatment,
                      path="treatment/details", http_method="GET", name="treatment.details")
    def treatment_details(self,request):

        treatment = ndb.Key(urlsafe=request.ekey).get()
        patient = treatment.key.parent().get()

        treatment_msg = treatment.to_message()
        treatment_msg.actions = treatment.get_actions_messages()

        treatment_details = EntireTreatment(treatment=treatment_msg, patient=patient.to_message())

        return treatment_details

    @endpoints.method(KEY_CONTAINER, treatments_messages.TreatmentsCollection,
                      path="treatments", http_method="GET", name="treatments.all")
    def treatments(self, request):

        treatments = Treatment.get_actives_by_doctor(ndb.Key(urlsafe=request.ekey))

        treatments_msg = []

        for t in treatments:
            treatments_msg.append(t.to_message(with_patient=True))

        return TreatmentsCollection(treatments=treatments_msg)



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
            MappedObjectMsg(description='Cápsulas'.decode('utf-8'), for_db='c'),
            MappedObjectMsg(description='Jarabe', for_db='j'),
            MappedObjectMsg(description='Ampolla', for_db='a'),
            MappedObjectMsg(description='Inyección'.decode('utf-8'), for_db='i')
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

    @endpoints.method(KEY_CONTAINER, treatments_messages.PatientsCollection,
                      path="patients", http_method="GET", name="patients.all")
    def patients(self, request):

        doctor = ndb.Key(urlsafe=request.ekey).get()

        patients = doctor.patients()

        patients_msg = []
        for p in patients:
            patients_msg.append(p.to_message(ignore_fields=('doctor_key',), with_active_treatment=True))

        return treatments_messages.PatientsCollection(patients=patients_msg)









