import flask.ext.restless
from . import app
from .database import db, NSRLFile, NSRLProduct

manager = flask.ext.restless.APIManager(app, flask_sqlalchemy_db=db)

manager.create_api(NSRLFile, methods=['GET'])
manager.create_api(NSRLProduct, methods=['GET'])
