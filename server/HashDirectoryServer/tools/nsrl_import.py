import argparse
import csv
import os
from io import TextIOWrapper
from tempfile import NamedTemporaryFile
from zipfile import ZipFile

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('database_uri', help='SQLAlchemy database connection string')
    parser.add_argument('-z', '--zip', help='Path to RDS zip file to import')
    args = parser.parse_args()
    
    if args.zip is None:
        print('Zip file parameter is required')
        return

    with NamedTemporaryFile('w') as config_file:
        print('SQLALCHEMY_DATABASE_URI =', args.database_uri, file=config_file)
        os.environ['HASHSERVERCONFIG'] = config_file.name
        from HashDirectoryServer import app
        from HashDirectoryServer.database import db, NSRLProduct, NSRLFile

    with ZipFile(args.zip, 'r') as zf:
        print('Reading product list..')
        with TextIOWrapper(zf.open('NSRLProd.txt'), encoding='UTF-8') as prodfile:
            header = prodfile.readline().strip()
            assert header == '"ProductCode","ProductName","ProductVersion","OpSystemCode","MfgCode","Language","ApplicationType"'

            n_added = 0
            for line in csv.reader(prodfile):
                product_code, name, version, _, _, _, type = line
                product_code = int(product_code)

                if NSRLProduct.query.get(product_code) is not None:
                    continue
                n_added += 1
                product = NSRLProduct(product_code=int(product_code),
                                      name=name, type=type)
                db.session.add(product)
            print('Committing', n_added, 'new products,', NSRLProduct.query.count(), 'total')
            db.session.commit()

        print('Reading file list..')
        with TextIOWrapper(zf.open('NSRLFile.txt'), encoding='UTF-8', errors='replace') as filesfile:
            header = filesfile.readline().strip()
            assert header == '"SHA-1","MD5","CRC32","FileName","FileSize","ProductCode","OpSystemCode","SpecialCode"'

            n_added = 0
            for line in csv.reader(filesfile):
                sha1, md5, crc32, file_name, file_size, product_code, _, special_code = line
                file_size = int(file_size)
                product_code = int(product_code)
                special_code = special_code or None

                existing = NSRLFile.query.filter_by(sha1=sha1)
                if existing.count() > 1:
                    existing = existing.filter_by(file_name=file_name)
                assert existing.count() <= 1
                if existing.count() > 0:
                    print('Ignore existing file', file_name, 'with sha1', sha1)
                    continue
                n_added += 1
                if n_added % 1000 == 0:
                    print('.', end='', flush=True)
                file = NSRLFile(sha1=sha1, md5=md5, crc32=crc32,
                                file_name=file_name, file_size=file_size,
                                product_code=product_code, special_code=special_code)
                db.session.add(file)
            print('\nCommitting', n_added, 'new files,', NSRLFile.query.count(), 'total')
            db.session.commit()



if __name__ == '__main__':
    main()
