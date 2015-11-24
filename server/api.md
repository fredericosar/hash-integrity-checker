All API endpoints have a URL prefix of `api/`.

All endpoints are searchable, with the [Flask-Restless][flask-restless] search
interface.

[flask-restless]: https://flask-restless.readthedocs.org/en/latest/searchformat.html

`nsrl_file/<id>`
:    a file in the NSRL RDS database. Each file is associated with no more than
     one product, but there may be multiple files for a given product.
     Read-only interface.
     
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
:    a product in the NSRL RDS database. Read-only.

     Attributes:

      * `product_code`
      * `name`: name of the software (eg, 'Windows')
      * `version`: software version (eg, '3.11')
      * `type`: category of software (eg, 'Operating System')
      * `files`: list of `nsrl_file`s associated with the product

`user_file/<id>`
:    a user-supplied download datapoint. May be read (`GET`) or new entries
     may be written (`POST`). Entries may not be deleted or modified.

     Attributes:

      * `id`
      * `timestamp`: time the file was seen (when the download was begun or
        perhaps finished).
      * `sha1`: SHA-1 hash of the file's contents, hex string
      * `md5`: MD5 hash of the file's contents, hex string
      * `file_name`: Name of the downloaded file in the filesystem.
      * `source_url`: URL from which the file was downloaded.

     The `file_name` field may not be a suffix of the `source_url` field, since
     the server may specify a filename different from what appears in the URL
     (such as via `Content-Disposition: attachment`). Similarly, a single file
     might be found at multiple URLs (such as in a CDN).

     The SHA-1, file name and source URL must be provided. Other fields may be
     omitted.
