import flask
from os import getenv

class DefaultConfig(object):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///sqlite.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

CONFIG_VAR = 'HASHSERVERCONFIG'
CONFIG_FILE = getenv(CONFIG_VAR)
CONFIG_TEMPLATE_VAR = CONFIG_VAR + '_TEMPLATE'
CONFIG_TEMPLATE = getenv(CONFIG_TEMPLATE_VAR)

app = flask.Flask(__name__)
app.config.from_object(DefaultConfig)
if CONFIG_TEMPLATE is not None:
    app.config.from_object(CONFIG_TEMPLATE)
if CONFIG_FILE is not None:
    app.config.from_envvar('HASHSERVERCONFIG')

from . import database, api

def run_app():
    database.db.create_all()
    app.run()

