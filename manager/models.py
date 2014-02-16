'''
Created on 11/02/2014

@author: Capi
'''

from google.appengine.ext import ndb
from manager.api.treatments_messages import SpecialityMsg

class Person(ndb.Model):

    genders = ['M', 'F', 'N']

    first_name = ndb.StringProperty(required=True)
    last_name = ndb.StringProperty(required=True)
    gender = ndb.StringProperty(choices=genders)

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
    person = ndb.StructuredProperty(Person, required=True)
    birthday = ndb.DateProperty()




