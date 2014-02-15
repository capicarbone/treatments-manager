# -*- coding:utf-8 -*-

'''
Created on 11/02/2014

@author: Capi

'''

import views

routers = [

        # Páginas
        ('/', views.MainPage),
        ('/manager', views.ManagerPage),
        ('/amministratore', views.AmministratorePage),

        # Plantillas para gesti�n de doctores
        ('/admin_dashboard.html', views.AdminDashboardTemplate),
        ('/doctors_manager.html', views.DoctorsManagerTemplate),
        ('/doctor_form.html', views.DoctorFormTemplate),

        ]
