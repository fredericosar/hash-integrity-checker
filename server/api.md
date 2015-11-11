All API endpoints have a URL prefix of `api/`.

All endpoints are searchable, with the [Flask-Restless][flask-restless] search
interface.

`nsrl_file/<id>`
:    a file in the NSRL RDS database. Each file is associated with no more than
     one product, but there may be multiple files for a given product.
     
     Attributes:

      * `id`
      * `sha1`: SHA-1 hash of the file, hex string
      * `md5`: MD5 hash of the file, hex string
      * `crc32`: CRC32 hash of the file, hex string
      * `file_name`: canonical name of the file
      * `file_size`: size of file in bytes, integer
      * `product_code`: ID of the associated `nsrl_product`
      * `special_code`: one of 'M' for malware, 'S' for a special file, or
        nothing.

`nsrl_product/<product_code>`
:    a product in the NSRL RDS database.

     Attributes:

      * `product_code`
      * `name`: name of the software (eg, 'Windows')
      * `version`: software version (eg, '3.11')
      * `type`: category of software (eg, 'Operating System')
      * `files`: list of `nsrl_file`s associated with the product
