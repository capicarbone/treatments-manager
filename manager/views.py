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
        template = JE.get_template('boilerplate.html')

        user = users.get_current_user()

        if user:
            self.redirect('/manager')
        else:
            self.redirect(users.create_login_url('/'))

        self.response.out.write(template.render({}))

class AmministratorePage(webapp.RequestHandler):
    def get(self, *args):
        template = JE.get_template('admin.html')

        self.response.out.write(template.render({}))

class AdminDashboardTemplate(webapp.RequestHandler):
    def get(self, *args):
        template = JE.get_template('admin_dashboard.html')

        self.response.out.write(template.render({}))

class DoctorsManagerTemplate(webapp.RequestHandler):
    def get(self, *args):
        template = JE.get_template('doctors_manager.html')

        self.response.out.write(template.render({}))
