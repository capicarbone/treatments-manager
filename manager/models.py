'''
Created on 11/02/2014

@author: Capi
'''

from google.appengine.ext import ndb
import manager.api.treatments_messages
from manager.api.treatments_messages import SpecialityMsg, PatientMsg, PersonMsg,\
    DoctorMsg, TreatmentMsg, MedicamentMsg, MappedObjectMsg, TreatmentActionMsg
from protorpc import message_types, messages

from datetime import time

class MessageModel(ndb.Model):

    def __init__(self, *args, **kwargs):

        message = None
        try:
            message = kwargs['message']
            del(kwargs['message'])
        except KeyError:
            pass

        # TODO: Esto puede ser supremamente mejorado llamando al init con un diccionario de los campos

        super(MessageModel, self).__init__( **kwargs)

        if message:
            self.from_message(message)


    def from_message(self, msg):

        if isinstance(msg, self.message_class):

            for field in msg.all_fields():

                try:
                    if field.name in self.ignore_fields:
                        continue
                except AttributeError:
                    pass

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

        try:
            msg.key = self.key.urlsafe()
        except AttributeError:
            pass

        return msg


class Person(MessageModel):

    genders = ['M', 'F', 'N']

    first_name = ndb.StringProperty()
    last_name = ndb.StringProperty()
    gender = ndb.StringProperty(choices=genders)

    message_class = PersonMsg

    def to_message(self):

        msg = self.message_class()

        msg.first_name = self.first_name
        msg.last_name = self.last_name
        msg.gender = self.gender

        return msg

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

    def to_message(self):

        msg = super(Doctor, self).to_message()

        msg.email = self.email
        msg.person = self.person.to_message()

        return msg


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

    def to_message(self):

        msg = super(Patient, self).to_message()

        msg.person = self.person.to_message()
        msg.blood_type = self.blood_type
        msg.allergies = self.allergies
        msg.doctor_key = self.key.parent().urlsafe()

        return msg


class TreatmentAction(MessageModel):

    message_class = TreatmentActionMsg
    ignore_fields = ('medicament', 'take_hour')

    time_interval = ndb.IntegerProperty()
    action_type = ndb.StringProperty()
    take_hour = ndb.TimeProperty()

    medicament = ndb.KeyProperty()

    def from_message(self, msg):
        super(TreatmentAction, self).from_message(msg)

        if msg.medicament:
            self.medicament = ndb.Key(urlsafe=msg.medicament.key)

        self.take_hour = time(msg.take_hour.hour, msg.take_hour.minute)

    def to_message(self):
        msg = super(TreatmentAction,self).to_message()

        m = self.medicament.get()
        msg.medicament = m.to_message()
        msg.action_type = self.action_type
        msg.time_interval = self.time_interval

        return msg

class Treatment(MessageModel):

    message_class = TreatmentMsg
    ignore_fields = ('patient_key', 'actions')

    display_code = ndb.StringProperty()
    is_active = ndb.BooleanProperty(default=False)
    objetives = ndb.StringProperty()

    created_at = ndb.DateTimeProperty(auto_now_add=True)


    def to_message(self):

        msg = super(Treatment,self).to_message()

        msg.display_code = self.display_code
        msg.is_active = self.is_active
        msg.objetives = self.objetives
        msg.patient_key = self.key.parent().urlsafe()

        return msg

    def generate_code(self):

        code = ''

        id_str = str(self.key.id())

        partition = ''
        for c in id_str:
            partition = partition + c

            if len(partition) == 2:

                n = int(partition)
                start_range = 97
                ends_range = 122

                n = n % (ends_range - start_range)

                code = code + chr(n + start_range)
                partition = ''

        self.display_code = code

    @classmethod
    def by_code(cls, code):
        query = cls.query(cls.display_code == code).fetch(1)

        if len(query) > 0:
            return query[0]
        else:
            return None

    def get_actions(self):

        actions = TreatmentAction.query().filter(parent=self.key)

        return actions

    def get_actions_messages(self):

        actions = self.get_actions()

        actions_msgs = []
        for a in actions:
            actions_msgs.append(a.to_message())

        return actions_msgs



class Medicament(MessageModel):

    message_class = MedicamentMsg
    ignore_fields = ('registered_by', 'registered_at', 'presentation')

    name = ndb.StringProperty()
    dose = ndb.StringProperty()
    description = ndb.StringProperty()

    presentation = ndb.StringProperty()

    registered_by = ndb.KeyProperty()
    registered_at = ndb.DateTimeProperty(auto_now_add=True)

    def from_message(self, msg):

        super(Medicament, self).from_message(msg)

        self.registered_by = ndb.Key(urlsafe=msg.registered_by)
        self.presentation = msg.presentation.for_db

    def to_message(self):

        msg = MedicamentMsg()

        msg.key = self.key.urlsafe()
        msg.name = self.name
        msg.dose = self.dose
        msg.description = self.description
        msg.presentation = MappedObjectMsg(for_db=self.presentation)

        return msg





















