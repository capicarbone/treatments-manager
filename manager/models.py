'''
Created on 11/02/2014

@author: Capi
'''

from google.appengine.ext import ndb

class Person(ndb.Model):

    genders = ['M', 'F']

    first_name = ndb.StringProperty(required=True)
    last_name = ndb.StringProperty(required=True)
    gender = ndb.StringProperty(choices=genders)

class Doctor(ndb.Model):

    user = ndb.UserProperty()
    person_data = ndb.StructuredProperty(Person)
    registered_at = ndb.DateTimeProperty(auto_now_add=True)
    specialities = ndb.KeyProperty(repeatable=True)

class Speciality(ndb.Model):
    name = ndb.StringProperty(required=True)
    descripcion = ndb.StringProperty()