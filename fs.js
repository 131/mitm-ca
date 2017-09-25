"use strict";

const fs   = require('fs');
const path = require('path');
const mkdirpSync = require('nyks/fs/mkdirpSync');

const CA = require('./core');

class CAfs extends CA {
  constructor(CAfolder)  {

    var store =  {
      get : async function(hostname) {
        var wd = path.join(CAfolder, hostname);
        var certPath = path.join(wd, 'server.crt');
        var keyPath  = path.join(wd, 'server.rsa');

        if(!(fs.existsSync(certPath) && fs.existsSync(keyPath)))
          return null;
        return {
          key  : fs.readFileSync(keyPath, 'utf-8'),
          cert : fs.readFileSync(certPath, 'utf-8')
        };
      },

      set : async function(hostname, bundle) {
        var wd = path.join(CAfolder, hostname);
        mkdirpSync(wd);
        var certPath = path.join(wd, 'server.crt');
        var keyPath  = path.join(wd, 'server.rsa');
        fs.writeFileSync(certPath, bundle.cert);
        fs.writeFileSync(keyPath, bundle.key);
        return true;
      }
    };

    super(store);
  }
}

module.exports = CAfs;