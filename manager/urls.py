'''
Created on 11/02/2014

@author: Capi

'''

import views

routers = [
        ('/manager', views.ManagerPage),
        ('/amministratore', views.AmministratorePage),
        ('/admin_dashboard', views.AdminDashboardTemplate),
        ('/doctors_manager', views.DoctorsManagerTemplate),
        ('/', views.MainPage),
        ]
