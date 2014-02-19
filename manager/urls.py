# -*- coding:utf-8 -*-

'''
Created on 11/02/2014

@author: Capi

'''

import views
from webapp2 import Route

R = Route

routers = [
    R(r'/', handler=views.MainPage),
    R(r'/manager', handler=views.ManagerPage),
    R(r'/amministratore', handler=views.AmministratorePage),

    R(r'/template/<template_file>', handler=views.GetTemplate),
]
