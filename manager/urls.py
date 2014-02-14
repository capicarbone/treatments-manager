# -*- coding:utf-8 -*-

'''
Created on 11/02/2014

@author: Capi

'''

import views

routers = [
        ('/manager', views.ManagerPage),
        ('/amministratore', views.AmministratorePage),
        ('/admin_dashboard.html', views.AdminDashboardTemplate),

        # Plantillas para gestión de doctores
        ('/doctors_manager.html', views.DoctorsManagerTemplate),
        ('/doctor_form.html', views.DoctorFormTemplate),
        ('/', views.MainPage),
        ]
