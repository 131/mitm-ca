'use strict';

const Forge     = require('node-forge');
const randHex   = require('mout/random/randHex');
const pki = Forge.pki;

const props = require('./ca.props');


class CAForge {

  constructor(store) {
    this.store = store && store.get ? store : new Map([["ca", store]]);
  }

  static generateCA() {
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
    certServer.setIssuer(this.CA.cert.issuer.attributes);

    certServer.setExtensions(props.ServerExtensions.concat([{
      name: 'subjectAltName',
      altNames: hosts.map(function(host) {
        if (host.match(/^[\d\.]+$/)) {
          return {type: 7, ip: host};
        }
        return {type: 2, value: host};
      })
    }]));

    certServer.sign(this.CA.key, Forge.md.sha256.create());

    return {
      cert : pki.certificateToPem(certServer),
      key  : pki.privateKeyToPem(keysServer.privateKey)
    };
  }

  async _getCA(){
    var bundle = await this.store.get("ca");
    if(!bundle) {
      bundle = await CAForge.generateCA();
      await this.store.set("ca", bundle);
    }

    return {
      cert : pki.certificateFromPem(bundle.cert),
      key  : pki.privateKeyFromPem(bundle.key)
    };
  }

  async getBundle(hostname) {
    if(!this.CA)
      this.CA = await this._getCA();

    var bundle = await this.store.get(hostname);
    if(!bundle) {
      bundle = this._generateServerCertificateKeys(hostname);
      await this.store.set(hostname, bundle);
    }

    return bundle;
  }


}



module.exports = CAForge;
