'''
Created on 11/02/2014

@author: Capi
'''

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from manager.urls import routers
import endpoints

from manager.api import admin, for_doctors, for_patients


ENDPOINTS = endpoints.api_server([
                                  admin.AdminApi,
                                  for_doctors.ForDoctorApi,
                                  for_patients.ForPatientApi
                                  ])

def main():
    APPLICATION = webapp.WSGIApplication(routers, debug=True)
    run_wsgi_app(APPLICATION)

if __name__ == "__main__":
    main()
