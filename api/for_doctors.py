# -*- coding:utf-8 -*-

'''
Created on 14/02/2014

@author: Capi
'''

import endpoints
from google.appengine.ext import ndb
from protorpc import remote, message_types, messages

from api import treatments_messages
from api.treatments_messages import MappedObjectMsg, EntireTreatment, \
    TreatmentsCollection, DiaryFulfillmentCollectionMsg, ChartPoint, ChartData
from models import *


@endpoints.api(name="doctor", version="v1",
               description="API for doctor users.")
class ForDoctors(remote.Service):

    # Resource Containers

    KEY_CONTAINER = endpoints.ResourceContainer(ekey=messages.StringField(1))
    ID_CONTAINER = endpoints.ResourceContainer(id=messages.StringField(1))

    ACTION_REQUEST_PARAMS = endpoints.ResourceContainer(fulfillments_range_init=messages.IntegerField(1),
                                                        fulfillments_range_finish=messages.IntegerField(2),
                                                        ekey=messages.StringField(4)
                                                        )

    @endpoints.method(treatments_messages.PatientMsg, treatments_messages.PatientMsg,
                      path="patient", http_method="POST", name="patient.save")
    def patient_save(self, patient_msg):

        patient = Patient(message=patient_msg, parent=ndb.Key(urlsafe=patient_msg.doctor_key))
        patient.put()

        patient_msg = patient.to_message(ignore_fields=('doctor_key',))

        return patient_msg

    @endpoints.method(KEY_CONTAINER, treatments_messages.PatientMsg,
                      path="patient/get", http_method="GET", name="patient.details")
    def patient_details(self, request):

        patient = ndb.Key(urlsafe=request.ekey).get()

        patient_msg = patient.to_message()

        return patient_msg

    @endpoints.method(KEY_CONTAINER, treatments_messages.TreatmentsCollection,
                      path="patient/treatments", http_method="GET", name="patient.treatments")
    def patient_treatments(self, request):

        patient_key = ndb.Key(urlsafe=request.ekey)
        treatments = Treatment.query(ancestor=patient_key)

        treatments_msgs = []

        for t in treatments:
            treatments_msgs.append(t.to_message())

        return TreatmentsCollection(treatments=treatments_msgs)

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

        last_finish_date = None

        for a in treatment_msg.actions:
            action = TreatmentAction(message=a, parent=treatment.key)
            action.made_count = 0
            action.past_count = 0
            action.put()
            a.key = action.key.urlsafe()

            if (last_finish_date == None):
                last_finish_date = action.finish_date
            else:
                last_finish_date = action.finish_date if action.finish_date > last_finish_date else last_finish_date

        treatment.finish_date = last_finish_date
        treatment.put()

        treatment_msg = treatment.to_message()

        return treatment_msg

    @endpoints.method(KEY_CONTAINER, treatments_messages.EntireTreatment,
                      path="treatment/details", http_method="GET", name="treatment.details")
    def treatment_details(self,request):

        treatment = ndb.Key(urlsafe=request.ekey).get()
        patient = treatment.key.parent().get()

        treatment_msg = treatment.to_message()
        treatment_msg.actions = treatment.get_actions_messages()

        for action_msg in treatment_msg.actions:

            action = TreatmentAction(action_msg)

            if (action_msg.measurement):   # Revisar por qué no funciona isMeasurement
                action_msg.measurement.chart_data = ChartData(points=[])
                chart_points = []

                fulfillments = Fulfillment.query(ancestor=ndb.Key(urlsafe=action_msg.key))

                for f in fulfillments:
                    point = ChartPoint(value=float(f.value), tag=str(f.action_moment))
                    chart_points.append(point)

                action_msg.measurement.chart_data = ChartData(points=chart_points)

        treatment_details = EntireTreatment(treatment=treatment_msg, patient=patient.to_message())

        return treatment_details

    @endpoints.method(KEY_CONTAINER, treatments_messages.DiaryFulfillmentCollectionMsg,
                      path="treatment/diary_fullfilments", http_method="GET", name="treatment.diary_fulfillments")
    def diary_fulfillments(self, request):

        response = DiaryFulfillmentCollectionMsg()

        treatment_key = ndb.Key(urlsafe=request.ekey)

        result = DiaryFulfillment.query(ancestor=treatment_key).order(DiaryFulfillment.day)

        for r in result:
            response.diary_fulfillments.append(r.to_message())

        return response


    @endpoints.method(KEY_CONTAINER, treatments_messages.TreatmentsCollection,
                      path="treatments", http_method="GET", name="treatments.all")
    def treatments(self, request):

        treatments = Treatment.get_actives_by_doctor(ndb.Key(urlsafe=request.ekey))

        treatments_msg = []

        for t in treatments:
            treatments_msg.append(t.to_message(with_patient=True))

        return TreatmentsCollection(treatments=treatments_msg)

    @endpoints.method(KEY_CONTAINER, treatments_messages.ChartData,
                      path="treatment/measurement/behavior", http_method="GET", name="treatments.measurement.behavior")
    def measurement_behavior(self, request):

        chart_points = []

        fulfillments = Fulfillment.query(ancestor=ndb.Key(urlsafe=request.ekey))

        for f in fulfillments:
            point = ChartPoint(value=f.value, tag=str(f.day))
            chart_points.append(point)

        return ChartData(points=chart_points)


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

    @endpoints.method(ACTION_REQUEST_PARAMS, treatments_messages.TreatmentActionMsg,
                      path="treatment/action", http_method="GET", name="treatment.action.get")
    def action_details(self, request):

        action = ndb.Key(urlsafe=request.ekey).get()

        action_msg = action.to_message()

        if request.fulfillments_range_init is not None and request.fulfillments_range_finish is not None:
            query = Fulfillment.query(ancestor=action.key).order(Fulfillment.for_moment)
            fulfillments = query.fetch(request.fulfillments_range_finish)

            fulfillments_msgs = []

            for f in fulfillments:

                fulfillments_msgs.append(f.to_message())

            action_msg.fulfillments = fulfillments_msgs

        return action_msg










