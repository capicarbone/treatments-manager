# -*- coding:utf-8 -*-
'''
Created on 11/02/2014

@author: Capi
'''

from datetime import time
import datetime
import calendar
from thirdparties.dateutil import parser

from google.appengine.ext import ndb
from protorpc import message_types

from api.treatments_messages import SpecialityMsg, PatientMsg, PersonMsg, \
    DoctorMsg, TreatmentMsg, MedicamentMsg, MappedObjectMsg, TreatmentActionMsg, FulfillmentMsg,\
    DiaryFulfillmentMsg, MeasurementMsg


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
                    if field.name is 'key' or field.name in self.ignore_fields:
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

    def to_message(self, ignore_fields=[]):

        msg = self.message_class()

        fields_names = [f.name for f in msg.all_fields() ]

        if not 'key' in ignore_fields:
            try:
                msg.key = self.key.urlsafe()
            except AttributeError:
                pass

        if 'id' in fields_names and 'id' not in ignore_fields:
            if self.key:
                msg.id = str(self.key.id())

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


class Speciality(MessageModel):
    message_class = SpecialityMsg

    name = ndb.StringProperty()
    descripcion = ndb.StringProperty()

    def to_message(self):

        speciality_msg = super(Speciality, self).to_message()

        speciality_msg.description = self.descripcion
        speciality_msg.name = self.name

        return speciality_msg


class Measurement(MessageModel):

    message_class = MeasurementMsg

    name = ndb.StringProperty(required=True)
    unit = ndb.StringProperty()
    indications = ndb.StringProperty()

    def to_message(self):
         msg = self.message_class()

         msg.name = self.name
         msg.unit = self.unit
         msg.indications = self.indications

         return msg

class TreatmentAction(MessageModel):

    MEDICAMENT_TYPE = 'M'
    MEASUREMENT_TYPE = 'I'

    message_class = TreatmentActionMsg
    ignore_fields = ('medicament', 'measurement', 'take_hour')

    time_interval = ndb.IntegerProperty()
    action_type = ndb.StringProperty()
    take_hour = ndb.TimeProperty()

    past_count = ndb.IntegerProperty(default=0)
    made_count = ndb.IntegerProperty(default=0)

    medicament = ndb.KeyProperty()
    measurement = ndb.StructuredProperty(Measurement)

    def from_message(self, msg):
        super(TreatmentAction, self).from_message(msg)

        if msg.medicament:
            self.medicament = ndb.Key(urlsafe=msg.medicament.key)

        if msg.measurement:
            self.measurement = Measurement(message=msg.measurement)

        if msg.take_hour:
            take_hour = parser.parse(msg.take_hour)
            self.take_hour = time(take_hour.hour, take_hour.minute)

    def to_message(self, ignore_fields=[]):
        msg = super(TreatmentAction,self).to_message(ignore_fields)

        if (self.isForMedicamentTake()):
            m = self.medicament.get()

            if 'medicament__key' in ignore_fields:
                msg.medicament = m.to_message(ignore_fields=['key'])
            else:
                msg.medicament = m.to_message()

        if (self.isForMeasurement()):
            m = self.measurement

            msg.measurement = self.measurement.to_message()

        msg.action_type = self.action_type
        msg.time_interval = self.time_interval
        msg.made_count = self.made_count
        msg.past_count = self.past_count
        msg.id =str(self.key.id())

        if self.past_count and self.past_count != 0:
            msg.fulfillment_porcentage = float(float(self.made_count) / float(self.past_count))*100.0

        if self.take_hour:
            msg.take_hour = self.take_hour.isoformat()

        return msg

    def isForMedicamentTake(self):
        return self.action_type == self.MEDICAMENT_TYPE

    def isForMeasurement(self):
        return self.action_type == self.MEASUREMENT_TYPE

class Treatment(MessageModel):

    message_class = TreatmentMsg
    ignore_fields = ('patient_key','created_at', 'patient', 'fulfillment_porcentage', 'last_syncronize_at', 'last_resport_time')

    display_code = ndb.StringProperty()
    is_active = ndb.BooleanProperty(default=False)
    objetives = ndb.StringProperty()
    past_actions_count = ndb.IntegerProperty(default=0)
    made_actions_count = ndb.IntegerProperty(default=0)

    created_at = ndb.DateTimeProperty(auto_now_add=True)
    last_syncronize_at = ndb.DateTimeProperty()

    update_time = ndb.TimeProperty()

    last_report_time = ndb.DateTimeProperty()


    def to_message(self, ignore_fields=['patient_key'], with_patient=False):

        msg = super(Treatment,self).to_message(ignore_fields)

        msg.display_code = self.display_code
        msg.is_active = self.is_active
        msg.objetives = self.objetives
        msg.created_at = self.created_at.isoformat()
        msg.init_date = msg.created_at     # TODO: Deberia ser la fecha guardada en la bd
        msg.past_actions_count = self.past_actions_count
        msg.made_actions_count = self.made_actions_count
        msg.last_report_time = self.last_report_time.isoformat() if self.last_report_time else None

        if self.past_actions_count and self.past_actions_count != 0:
            msg.fulfillment_porcentage = float(float(self.made_actions_count) / float(self.past_actions_count))*100.0
        else:
            msg.fulfillment_porcentage = 0.0

        msg.is_sync = self.last_syncronize_at is not None

        if not 'patient_key' in ignore_fields:
            msg.patient_key = self.key.parent().urlsafe()

        if with_patient:
            msg.patient = self.get_patient().to_message()

        return msg

    def get_patient(self):

        return self.key.parent().get()

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

    @classmethod
    def get_actives_by_doctor(cls, doctor_key):

        treatments = cls.query(ancestor=doctor_key)

        return treatments

    def get_actions(self):

        actions = TreatmentAction.query(ancestor=self.key)

        return actions

    def get_actions_messages(self, ignore_fields=[]):

        actions = self.get_actions()

        actions_msgs = []
        for a in actions:
            actions_msgs.append(a.to_message(ignore_fields=ignore_fields))

        return actions_msgs

class Patient(MessageModel):

    message_class = PatientMsg
    ignore_fields = ('birthday',)

    person = ndb.StructuredProperty(Person)
    birthday = ndb.DateProperty()
    blood_type = ndb.StringProperty()
    allergies = ndb.StringProperty()

    def from_message(self, patient_msg):

        self.person = Person(message=patient_msg.person)
        self.blood_type = patient_msg.blood_type
        self.allergies = patient_msg.allergies

        if patient_msg.birthday:
            self.birthday = parser.parse(patient_msg.birthday)

    def to_message(self,ignore_fields=[], with_active_treatment=False):

        msg = super(Patient, self).to_message(ignore_fields=ignore_fields)

        msg.person = self.person.to_message()
        msg.blood_type = self.blood_type
        msg.allergies = self.allergies

        if self.birthday:
            msg.birthday = self.birthday.isoformat()

        if not 'doctor_key' in ignore_fields:
            msg.doctor_key = self.key.parent().urlsafe()

        msg.id = str(self.key.id())

        if with_active_treatment:
            active_tratment = self.active_treatment()
            msg.active_treatment_key = active_tratment.key.urlsafe() if active_tratment else None

        return msg

    def active_treatment(self):

        treatments = Treatment.query(ancestor=self.key)

        for t in treatments:
            if t.is_active == True:
                return t

        return None



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

    def to_message(self,ignore_fields=[]):

        msg = super(Doctor, self).to_message(ignore_fields=ignore_fields)

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

    def patients(self):

        patients = Patient.query(ancestor=self.key)
        return patients


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

    def to_message(self, ignore_fields=[]):

        msg = super(Medicament,self).to_message(ignore_fields=ignore_fields)
        msg.name = self.name
        msg.dose = self.dose
        msg.description = self.description
        msg.presentation = MappedObjectMsg(for_db=self.presentation)
        msg.id = str(self.key.id())

        return msg

class Fulfillment(MessageModel):

    DESICION_REALIZED = 'T'
    DESICION_NOT_REALIZED = 'N'
    DECISION_DELAYED = 'P'

    message_class = FulfillmentMsg
    ignore_fields = ('action_id','action_moment', 'for_moment')

    decision = ndb.StringProperty()
    reason = ndb.StringProperty()
    action_moment = ndb.DateTimeProperty()
    minutes_delayed = ndb.IntegerProperty(default=1)

    for_moment = ndb.DateTimeProperty()

    def from_message(self, msg):
        super(Fulfillment, self).from_message(msg)

        if msg.action_moment:
            self.action_moment = parser.parse(msg.action_moment)

        if msg.for_moment:
            self.for_moment = parser.parse(msg.for_moment)

    def is_not_realized(self):
        return self.decision == self.DESICION_NOT_REALIZED

    def is_realized(self):
        return self.decision == self.DESICION_REALIZED

class DiaryFulfillment(MessageModel):
    """
        Representa el cumplimiento de un dia, conteniendo el total de acciones que deberieron
        ser cumplidas y el total de acciones cumplidas
    """

    message_class = DiaryFulfillmentMsg
    ignore_fields = ('day',)

    day = ndb.DateProperty()
    made_actions = ndb.IntegerProperty()
    total_actions = ndb.IntegerProperty()

    def from_message(self, msg):
        super(DiaryFulfillment, self).from_message(msg)

        if msg.day:
            self.day = parser.parse(msg.day)

    def to_message(self):

        message = DiaryFulfillmentMsg()
        message.made_actions = self.made_actions
        message.total_actions = self.total_actions
        message.day = str(self.day)

        return message


























