CA pki helper (generate & cache cert for any hostname from a dummy CA)


[![Version](https://img.shields.io/npm/v/mitm-ca.svg)](https://www.npmjs.com/package/mitm-ca)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](http://opensource.org/licenses/MIT)




# Usage

```
var CA = require('mitm-ca');

   // if not present, this will generate a dummy CA in cache folder
var vault = new CA('.CA_cache_folder');


//to retrieve a cert/key pair (to use as SSL cert), juste use

var bundle = vault.getBundle("somedomain.com");
console.log("Cert is", bundle.cert);
console.log("Key is", bundle.key);

// use it at https context if you want 
// file tree is now
───.CA_cache_folder
   │   ca.crt
   │   ca.rsa
   └───somedomain.com
           server.crt
           server.rsa
```


# Credits
* [131](https://github.com/131)
* inspired from joeferner/node-http-mitm-proxy/ca.js
