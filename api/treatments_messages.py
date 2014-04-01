# -*- coding:utf-8 -*-

'''
Created on 11/02/2014

@author: Capi
'''

from protorpc import messages
from protorpc import message_types

class MappedObjectMsg(messages.Message):
    description = messages.StringField(1)
    for_db = messages.StringField(2)

class SpecialityMsg(messages.Message):
    key = messages.StringField(1)
    name = messages.StringField(2, required=True)
    description = messages.StringField(3)

class SpecialitiesMsg(messages.Message):
    specialities = messages.MessageField(SpecialityMsg, 1, repeated=True)


class PersonMsg(messages.Message):
    first_name = messages.StringField(1)
    last_name = messages.StringField(2)
    gender = messages.StringField(3)


class DoctorMsg(messages.Message):
    key = messages.StringField(1)
    email = messages.StringField(2)
    person = messages.MessageField(PersonMsg, 3, required=True)
    registered_at = message_types.DateTimeField(4)
    specialities = messages.MessageField(SpecialityMsg, 5, repeated=True)

class PatientMsg(messages.Message):
    key = messages.StringField(1)
    person = messages.MessageField(PersonMsg, 2, required=True)
    birthday = messages.StringField(3)
    blood_type = messages.StringField(4)
    allergies = messages.StringField(5)

    doctor_key = messages.StringField(6)

    id = messages.StringField(7)

    with_active_treatment = messages.BooleanField(8)
    active_treatment_key = messages.StringField(9)

class PatientsCollection(messages.Message):
    patients = messages.MessageField(PatientMsg,1, repeated=True)

class MedicamentMsg(messages.Message):

    key = messages.StringField(1)
    name = messages.StringField(2)
    dose = messages.StringField(3)
    description = messages.StringField(4)

    presentation = messages.MessageField(MappedObjectMsg, 5)

    registered_by = messages.StringField(6)

    id = messages.StringField(7)

class TreatmentActionMsg(messages.Message):

    key = messages.StringField(5)
    id = messages.StringField(6)
    time_interval = messages.IntegerField(1)
    action_type = messages.StringField(2)
    take_hour = messages.StringField(3)

    medicament = messages.MessageField(MedicamentMsg, 4)


class TreatmentMsg(messages.Message):

    key = messages.StringField(1)
    display_code = messages.StringField(2)
    is_active = messages.BooleanField(3, default=True)
    objetives = messages.StringField(4)
    patient_key = messages.StringField(7)
    past_actions_count = messages.IntegerField(11, default=0)
    made_actions_count = messages.IntegerField(12, default=0)

    fulfillment_porcentage = messages.FloatField(13)

    id = messages.StringField(8)

    patient = messages.MessageField(PatientMsg, 9)

    actions = messages.MessageField(TreatmentActionMsg,5, repeated=True)

    created_at = messages.StringField(10)

class TreatmentsCollection(messages.Message):
    treatments = messages.MessageField(TreatmentMsg, 1, repeated=True)


class EntireTreatment(messages.Message):

    treatment = messages.MessageField(TreatmentMsg,1)
    doctor = messages.MessageField(DoctorMsg,2)
    patient = messages.MessageField(PatientMsg,3)

class Presentations(messages.Message):

    presentations = messages.MessageField(MappedObjectMsg, 1, repeated=True)

class MedicamentsCollection(messages.Message):
    medicaments = messages.MessageField(MedicamentMsg, 1, repeated=True)


# ---------- Fulfillments messages ----------

class FulfillmentMsg(messages.Message):

    action_id = messages.StringField(1, required=True)
    decision = messages.StringField(2)
    action_moment = messages.StringField(3)  # Momento en que se especificó el cumplimiento
    reason = messages.StringField(4)
    minutes_delayed = messages.IntegerField(5)

    for_moment = messages.StringField(6)    # Momento en el que debe cumplirse el cumplimiento

class ReportFulfillmentMsg(messages.Message):

    treatment_key = messages.StringField(1, required=True)
    fulfillments = messages.MessageField(FulfillmentMsg,2, repeated=True)





