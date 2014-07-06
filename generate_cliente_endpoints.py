
from subprocess import call


API_PATH =  "api.for_patients.ForPatients"


call(["endpointscfg.py", "get_client_lib", "java", API_PATH ])

