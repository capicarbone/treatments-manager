'''
Created on 11/02/2014

@author: Capi
'''
import os

from google.appengine.api import users
from google.appengine.ext import webapp

import jinja2

JE = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), 'templates')),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True
)

class ManagerPage(webapp.RequestHandler):
    def get(self, *args):
        template = JE.get_template('manager.html')

        self.response.out.write(template.render({}))

class MainPage(webapp.RequestHandler):
    def get(self, *args):


        user = users.get_current_user()

        if user:
            url_destiny = '/manager'
            if users.is_current_user_admin():
                url_destiny = '/amministratore'

            self.redirect(url_destiny)
        else:
            template = JE.get_template('index.html')
            login_url = users.create_login_url('/manager')
            self.response.out.write(template.render({
                                                     'login_url':  login_url
                                                     }))

class AmministratorePage(webapp.RequestHandler):
    def get(self, *args):
        template = JE.get_template('admin.html')

        # TODO Validarse si el usuario es administrador

        user= users.get_current_user()

        if (user):
            logout_url = users.create_logout_url('/')
            self.response.out.write(template.render({
                                                     'logout_url': logout_url
                                                     }))
        else:
            self.redirect('/manager')




class AdminDashboardTemplate(webapp.RequestHandler):
    def get(self, *args):
        template = JE.get_template('admin_dashboard.html')

        self.response.out.write(template.render({}))

class DoctorsManagerTemplate(webapp.RequestHandler):
    def get(self, *args):
        template = JE.get_template('doctors_manager.html')

        self.response.out.write(template.render({}))

class DoctorFormTemplate(webapp.RequestHandler):
    def get(self, *args):
        template = JE.get_template('doctor_form.html')

        self.response.out.write(template.render({}))
