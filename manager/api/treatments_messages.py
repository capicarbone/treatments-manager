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
    birthday = message_types.DateTimeField(3)
    blood_type = messages.StringField(4)
    allergies = messages.StringField(5)

    doctor_key = messages.StringField(6)

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
    take_hour = message_types.DateTimeField(3)

    medicament = messages.MessageField(MedicamentMsg, 4)

class TreatmentMsg(messages.Message):

    key = messages.StringField(1)
    display_code = messages.StringField(2)
    is_active = messages.BooleanField(3, default=True)
    objetives = messages.StringField(4)
    patient_key = messages.StringField(7)

    actions = messages.MessageField(TreatmentActionMsg,5, repeated=True)

class Presentations(messages.Message):

    presentations = messages.MessageField(MappedObjectMsg, 1, repeated=True)

class MedicamentsCollection(messages.Message):
    medicaments = messages.MessageField(MedicamentMsg, 1, repeated=True)


class EntireTreatment(messages.Message):

    treatment = messages.MessageField(TreatmentMsg,1)
    doctor = messages.MessageField(DoctorMsg,2)
    patient = messages.MessageField(PatientMsg,3)


