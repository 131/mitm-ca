'use strict';

const fs   = require('fs');
const path = require('path');

const Forge = require('node-forge');
const randHex    = require('mout/random/randHex');
const mkdirpSync = require('nyks/fs/mkdirpSync');
const pki = Forge.pki;

const props = require('./ca.props');


class CA {

  constructor(CAfolder) {
    this.CAfolder = CAfolder;
    var CAkeypath   = path.join(CAfolder, 'ca.rsa');
    var CAcertpath  = path.join(CAfolder, 'ca.crt');

    mkdirpSync(CAfolder);

    if(!fs.existsSync(CAcertpath)) {
      var ca = this._generateCA();
      fs.writeFileSync(CAkeypath, ca.key);
      fs.writeFileSync(CAcertpath, ca.cert);
    }

    this.CAcert = pki.certificateFromPem(fs.readFileSync(CAcertpath, 'utf-8'));
    this.CAkey  = pki.privateKeyFromPem(fs.readFileSync(CAkeypath, 'utf-8'));
  }

  _generateCA() {
    var keys = pki.rsa.generateKeyPair({bits: 2048});
    var cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = randHex(32);
    cert.validity.notBefore = new Date();
    cert.validity.notBefore.setDate(cert.validity.notBefore.getDate() - 1);
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);
    cert.setSubject(props.CAattrs);
    cert.setIssuer(props.CAattrs);
    cert.setExtensions(props.CAextensions);
    cert.sign(keys.privateKey, Forge.md.sha256.create());

    return {cert: pki.certificateToPem(cert), key: pki.privateKeyToPem(keys.privateKey) };
  }


  _generateServerCertificateKeys(hosts) {
    if (typeof(hosts) === "string")
      hosts = [hosts];
    var mainHost = hosts[0];

    var keysServer = pki.rsa.generateKeyPair(1024);
    var certServer = pki.createCertificate();

    certServer.publicKey = keysServer.publicKey;
    certServer.serialNumber = randHex(32);
    certServer.validity.notBefore = new Date();
    certServer.validity.notBefore.setDate(certServer.validity.notBefore.getDate() - 1);
    certServer.validity.notAfter = new Date();
    certServer.validity.notAfter.setFullYear(certServer.validity.notBefore.getFullYear() + 2);

    var attrsServer = props.ServerAttrs.slice(0);
    attrsServer.unshift({
      name: 'commonName',
      value: mainHost
    })
    certServer.setSubject(attrsServer);
    certServer.setIssuer(this.CAcert.issuer.attributes);

    certServer.setExtensions(props.ServerExtensions.concat([{
      name: 'subjectAltName',
      altNames: hosts.map(function(host) {
        if (host.match(/^[\d\.]+$/)) {
          return {type: 7, ip: host};
        }
        return {type: 2, value: host};
      })
    }]));

    certServer.sign(this.CAkey, Forge.md.sha256.create());

    return {
      cert : pki.certificateToPem(certServer),
      key  : pki.privateKeyToPem(keysServer.privateKey)
    };
  }


  getBundle(hostname) {
    var wd = path.join(this.CAfolder, hostname);
    var certPath = path.join(wd, 'server.crt');
    var keyPath  = path.join(wd, 'server.rsa');

    if(!(fs.existsSync(certPath) && fs.existsSync(keyPath))) {
      var bundle = this._generateServerCertificateKeys(hostname);
      mkdirpSync(wd);
      fs.writeFileSync(certPath, bundle.cert);
      fs.writeFileSync(keyPath, bundle.key);
    }

    return {
      key  : fs.readFileSync(keyPath, 'utf-8'),
      cert : fs.readFileSync(certPath, 'utf-8')
    };
  }

}



module.exports = CA;
