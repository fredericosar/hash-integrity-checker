import flask.ext.sqlalchemy
from . import app

db = flask.ext.sqlalchemy.SQLAlchemy(app)

# http://www.nsrl.nist.gov/Documents/Data-Formats-of-the-NSRL-Reference-Data-Set-16.pdf

class ValidationError(Exception):
    def __init__(self, field, error):
        self.errors = {field: error}

class NSRLFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    sha1 = db.Column(db.String(40), index=True)     # Hex string
    md5 = db.Column(db.String(32), index=True)      # Hex string
    crc32 = db.Column(db.String(8))     # Hex string
    file_name = db.Column(db.String(255), index=True)
    file_size = db.Column(db.Integer)

    product_code = db.Column(db.Integer, db.ForeignKey('nsrl_product.product_code'))
    product = db.relationship('NSRLProduct', backref=db.backref('files',
                                                                lazy='dynamic'))
    # operating system code omitted
    special_code = db.Column(db.Enum('M', 'S'))

class NSRLProduct(db.Model):
    product_code = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150))
    # Omit version since many versions map to the same product code
    # omit operating system, manufacturer, language(s)
    type = db.Column(db.String(50))

class UserFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime)

    sha1 = db.Column(db.String(40), index=True, nullable=False)
    md5 = db.Column(db.String(32), index=True)

    file_name = db.Column(db.String(255), index=True, nullable=False)
    source_url = db.Column(db.String(2048), index=True, nullable=False)

    # TODO validation would be nice
