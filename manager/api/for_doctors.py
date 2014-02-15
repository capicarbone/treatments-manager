'''
Created on 14/02/2014

@author: Capi
'''

import endpoints
from manager.models import Patient

@endpoints.api(name="doctor", version="v1",
               description="API for doctor users.")
class ForDoctorApi():

    @endpoints.method()
    def doctor_patients(self, request):
