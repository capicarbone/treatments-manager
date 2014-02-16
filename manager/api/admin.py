'''
Created on 13/02/2014

@author: Capi
'''

import endpoints
from treatments_messages import *
from manager.models import Doctor, Speciality
from protorpc import remote, message_types
from manager.api import treatments_messages

from google.appengine.api import users

@endpoints.api(name="admin", version="v1",
               description="API only for admin users operations")
class AdminApi(remote.Service):

    @endpoints.method(treatments_messages.DoctorMsg, treatments_messages.DoctorMsg,
                      path="doctor", http_method='POST',
                      name="doctor.save" )
    def doctor_save(self, doctor_msg):

        doctor = Doctor(email=doctor_msg.email)
        doctor.from_message(doctor_msg)
        doctor.user = users.User(doctor_msg.email)

        doctor.put()

        doctor_msg.registered_at = doctor.registered_at
        doctor_msg.id = str(doctor.key.id())

        return doctor_msg


    @endpoints.method(treatments_messages.SpecialityMsg, treatments_messages.SpecialityMsg,
                  path="speciality", http_method='POST',
                  name="speciality.save" )
    def speciality_save(self, speciality_msg):

        speciality = Speciality(name=speciality_msg.name)
        speciality.from_message(speciality_msg)

        speciality.put()

        speciality_msg.id = str(speciality.key.id())

        return speciality_msg

    @endpoints.method(message_types.VoidMessage, treatments_messages.SpecialitiesMsg,
              path="specialities", http_method='GET',
              name="specialities.all" )
    def specialities_all(self, speciality_msg):

        specialities_msg = SpecialitiesMsg()

        specialities = Speciality.query()

        for s in specialities:
            specialities_msg.specialities.append(s.to_message())

        return specialities_msg






