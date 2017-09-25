CA pki forge (generate & cache cert for any hostname from a dummy CA)


[![Version](https://img.shields.io/npm/v/mitm-ca.svg)](https://www.npmjs.com/package/mitm-ca)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](http://opensource.org/licenses/MIT)



# Usage (using FS driver)

```
const CA = require('mitm-ca/fs');

   // if not present, this will generate a dummy CA in cache folder
const vault = new CA('.CA_cache_folder');

//to retrieve a cert/key pair (to use as SSL cert), juste use

const bundle = await vault.getBundle("somedomain.com");
console.log("Cert is", bundle.cert);
console.log("Key is", bundle.key);

// use it at https context if you want 
// file tree is now

───.CA_cache_folder
   ├───ca
   │       server.crt < root CA cert
   │       server.rsa
   │
   └───somedomain.com
           server.crt
           server.rsa

```

# Usage (using RAM driver, no fs will be touched)

```
const CA = require('mitm-ca');

   // if not present, this will generate a dummy CA
const vault = new CA(); //optionnaly, you can specify a CA cert/key pair

//to retrieve a cert/key pair (to use as SSL cert), juste use

const bundle = await vault.getBundle("somedomain.com");
console.log("Cert is", bundle.cert);
console.log("Key is", bundle.key);


//use await vault.getBundle("ca") to retrieve ca if necessary
```



# Advanced usage / CLI usage
```
npm install mitm-ca
npm install -g cnyks

//generate a dummy ca and store it
cnyks mitm-ca --ir://run=generateCA --ir://json > ca.json

```


# Credits
* [131](https://github.com/131)
* inspired from joeferner/node-http-mitm-proxy/ca.js
