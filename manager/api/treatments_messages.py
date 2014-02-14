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


class PersonMsg(messages.Message):
    first_name = messages.StringField(1)
    last_name = messages.StringField(2)
    gender = messages.StringField(3)


class DoctorMsg(messages.Message):
    id = messages.StringField(1)
    email = messages.StringField(2)
    person_data = messages.MessageField(PersonMsg, 3, required=True)
    registered_at = message_types.DateTimeField(4)
    specialities = messages.MessageField(SpecialityMsg, 5, repeated=True)
