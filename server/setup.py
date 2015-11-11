#!/usr/bin/env python3

from setuptools import setup, find_packages

setup(name='HashDirectoryServer',
      version='0.1.0',
      description='Directory server for hash verification browser plugin',
      classifiers=[
          'Framework :: Flask',
          'Programming Language :: Python :: 3 :: Only',
      ],
      packages=find_packages(),
      install_requires=[
          'flask',
          'Flask-SQLAlchemy',
          'Flask-Restless',
          'Werkzeug != 0.11.0'  # Werkzeug bug #798
      ],
      entry_points={
          'console_scripts': [
              'HashDirectoryServer = HashDirectoryServer:run_app',
              'HashDirectoryServer-nsrl-import = HashDirectoryServer.tools.nsrl_import:main',
          ]
      }
)

