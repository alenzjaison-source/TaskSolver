import os
import sys

# Add backend directory to path so Django modules can be found
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

# Initialize Django WSGI application
from core.wsgi import application

# Vercel needs "app" exported as the serverless handler
app = application