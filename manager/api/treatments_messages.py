'''
Created on 11/02/2014

@author: Capi
'''

from protorpc import messages
from protorpc import message_types

class SpecialityMsg(messages.Message):
    id = messages.StringField(1)
    name = messages.StringField(2, required=True)
    description = messages.StringField(3)

class SpecialitiesMsg(messages.Message):
    specialities = messages.MessageField(SpecialityMsg, 1, repeated=True)


class PersonMsg(messages.Message):
    first_name = messages.StringField(1)
    last_name = messages.StringField(2)
    gender = messages.StringField(3)


class DoctorMsg(messages.Message):
    id = messages.StringField(1)
    email = messages.StringField(2)
    person = messages.MessageField(PersonMsg, 3, required=True)
    registered_at = message_types.DateTimeField(4)
    specialities = messages.MessageField(SpecialityMsg, 5, repeated=True)

class PatientMsg(messages.Message):
    id = messages.StringField(1)
    person = messages.MessageField(PersonMsg, 2, required=True)
    birthday = message_types.DateTimeField(3)


