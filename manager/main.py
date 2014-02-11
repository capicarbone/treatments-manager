'''
Created on 11/02/2014

@author: Capi
'''

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from manager.urls import routers


application = webapp.WSGIApplication(routers, debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
