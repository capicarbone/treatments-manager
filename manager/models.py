'''
Created on 11/02/2014

@author: Capi
'''

from google.appengine.ext import ndb

class Person(ndb.Model):

    genders = ['M', 'F', 'N']

    first_name = ndb.StringProperty(required=True)
    last_name = ndb.StringProperty(required=True)
    gender = ndb.StringProperty(choices=genders)

class Doctor(ndb.Model):

    userid = ndb.StringProperty()
    email = ndb.StringProperty(required=True)
    person_data = ndb.StructuredProperty(Person)
    registered_at = ndb.DateTimeProperty(auto_now_add=True)
    specialities = ndb.KeyProperty(repeated=True)

    def from_message(self, doctor_msg):

        self.email = doctor_msg.email
        self.registered_at = doctor_msg.registered_at

        person_msg = doctor_msg.person_data
        person_data = Person(first_name=person_msg.first_name,
                             last_name=person_msg.last_name,
                             gender=person_msg.gender
                             )

        self.person_data = person_data

        self.person_data


class Speciality(ndb.Model):
    name = ndb.StringProperty(required=True)
    descripcion = ndb.StringProperty()

    def from_message(self,speciality_msg):

        self.name = speciality_msg.name
        self.descripcion = speciality_msg.description
