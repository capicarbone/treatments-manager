'''
Created on 11/02/2014

@author: Capi
'''

from google.appengine.ext import ndb
import manager.api.treatments_messages
from manager.api.treatments_messages import SpecialityMsg, PatientMsg, PersonMsg,\
    DoctorMsg, TreatmentMsg
from protorpc import message_types, messages

class MessageModel(ndb.Model):

    def __init__(self, *args, **kwargs):

        message = None
        try:
            message = kwargs['message']
            del(kwargs['message'])
        except KeyError:
            pass

        super(MessageModel, self).__init__( **kwargs)

        if message:
            self.from_message(message)


    def from_message(self, msg):

        if isinstance(msg, self.message_class):

            for field in msg.all_fields():
                value = field.__get__(msg, msg.__class__)

                if not field.repeated:
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

    def to_message(self):

        msg = self.message_class()
        msg.id = str(self.key.id())

        return msg


class Person(MessageModel):

    genders = ['M', 'F', 'N']

    first_name = ndb.StringProperty()
    last_name = ndb.StringProperty()
    gender = ndb.StringProperty(choices=genders)

    message_class = PersonMsg

class Doctor(MessageModel):

    message_class = DoctorMsg

    userid = ndb.StringProperty()
    user = ndb.UserProperty()
    email = ndb.StringProperty(required=True)
    person = ndb.StructuredProperty(Person)
    registered_at = ndb.DateTimeProperty(auto_now_add=True)
    specialities = ndb.KeyProperty(repeated=True)

    def from_message(self, doctor_msg):

        super(Doctor, self).from_message(doctor_msg)

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




class Speciality(MessageModel):
    message_class = SpecialityMsg

    name = ndb.StringProperty()
    descripcion = ndb.StringProperty()

    def to_message(self):

        speciality_msg = super(Speciality, self).to_message()

        speciality_msg.description = self.descripcion
        speciality_msg.name = self.name

        return speciality_msg

class Patient(MessageModel):

    message_class = PatientMsg

    person = ndb.StructuredProperty(Person)
    birthday = ndb.DateProperty()
    blood_type = ndb.StringProperty()
    allergies = ndb.StringProperty()

    def from_message(self, patient_msg):

        self.person = Person(message=patient_msg.person)
        self.birthday = patient_msg.birthday
        self.blood_type = patient_msg.blood_type
        self.allergies = patient_msg.allergies


class TreatmentAction(MessageModel):

    time_interval = ndb.IntegerProperty()
    action_type = ndb.StringProperty()

    medicine = ndb.KeyProperty()




class Treatment(MessageModel):

    message_class = TreatmentMsg

    finish_date = ndb.DateProperty()
    display_code = ndb.StringProperty()
    is_active = ndb.BooleanProperty(default=False)
    objetives = ndb.StringProperty()

    created_at = ndb.DateTimeProperty(auto_now_add=True)

    actions = ndb.StructuredProperty(TreatmentAction, repeated=True)

    def from_message(self, treatment_msg):

        self.finish_date = treatment_msg.finish_date
        self.display_code = treatment_msg.display_code
        self.is_active = treatment_msg.is_active
        self.objetives = ndb.StringProperty()
















