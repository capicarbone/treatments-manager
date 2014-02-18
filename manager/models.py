'''
Created on 11/02/2014

@author: Capi
'''

from google.appengine.ext import ndb
import manager.api.treatments_messages
from manager.api.treatments_messages import SpecialityMsg, PatientMsg
from protorpc import message_types, messages


class Person(ndb.Model):

    genders = ['M', 'F', 'N']

    first_name = ndb.StringProperty()
    last_name = ndb.StringProperty()
    gender = ndb.StringProperty(choices=genders)

    def from_message(self, person_msg):

        self.first_name = person_msg.first_name
        self.last_name = person_msg.last_name
        self.gender = person_msg.gender

class Doctor(ndb.Model):

    userid = ndb.StringProperty()
    user = ndb.UserProperty()
    email = ndb.StringProperty(required=True)
    person = ndb.StructuredProperty(Person)
    registered_at = ndb.DateTimeProperty(auto_now_add=True)
    specialities = ndb.KeyProperty(repeated=True)

    def from_message(self, doctor_msg):

        self.email = doctor_msg.email
        self.registered_at = doctor_msg.registered_at

        person_msg = doctor_msg.person
        person_data = Person(first_name=person_msg.first_name,
                             last_name=person_msg.last_name,
                             gender=person_msg.gender
                             )

        self.person = person_data

        specialities_keys = []

        for s in doctor_msg.specialities:
            specialities_keys.append(ndb.Key('Speciality', s.id))

        self.specialities = specialities_keys

    @classmethod
    def by_email(cls, email):
        query = cls.query(cls.email == email).fetch(1)

        if len(query) > 0:
            return query[0]
        else:
            return None




class Speciality(ndb.Model):
    name = ndb.StringProperty(required=True)
    descripcion = ndb.StringProperty()

    def from_message(self,speciality_msg):

        self.name = speciality_msg.name
        self.descripcion = speciality_msg.description

    def to_message(self):

        speciality_msg = SpecialityMsg(name=self.name)
        speciality_msg.description = self.descripcion
        speciality_msg.id = str(self.key.id())

        return speciality_msg

class Patient(ndb.Model):
    person = ndb.StructuredProperty(Person)
    birthday = ndb.DateProperty()

    blood_type = ndb.StringProperty()

    message_class = PatientMsg

    def __init__(self, *args, **kwargs):

        message = None
        try:
            message = kwargs['message']
            del(kwargs['message'])
        except KeyError:
            pass

        super(Patient, self).__init__( **kwargs)

        if message:
            self.from_message(message)


    def from_message(self, patient_msg):

        if isinstance(patient_msg, self.message_class):

            for field in patient_msg.all_fields():
                value = field.__get__(patient_msg, patient_msg.__class__)
                try:
                    field_class = field.message_type
                    o = field_class()

                    if not isinstance(o, message_types.DateTimeField):
                        class_property = self._properties[field.name]._modelclass
                        o = class_property()
                        o.from_message(value)
                        setattr(self, field.name, o)
                    else:
                        setattr(self, field.name, value)

                except AttributeError:
                    setattr(self, field.name, value)





