'use strict';

const SwaggerRestify = require("swagger-restify-mw");
const restify = require("restify");
const accelPkg = require('lilly-api-oracle-accelerator');
const accelerator = accelPkg.api_accelerator;
const AcceleratorInst = accelerator.OracleAccelerator;
const fs = require('fs');
const app = restify.createServer();
var https_app = null;

/* istanbul ignore next */
const run = function(){
  var port = 80;
  var httpsPort=null;
  var verbose=true;
  var autoWireOptions = true;
  httpsPort = parseInt(process.env.httpsport);
  var hasHttps = (!isNaN(httpsPort));

  if(hasHttps){
    var fileTest = process.env.certificateFile;
    if(!fs.existsSync(fileTest)){
      throw 'SSL certificate not found.  If an https port is specified a certificate and key file must be specified.';
    }

    fileTest = process.env.keyFile;
    if(!fs.existsSync(fileTest)){
      throw 'SSL key file not found.  If an https port is specified a certificate and key file must be specified.';
    }

    var phrase = process.env.passphrase;
    if(phrase==null || phrase.length ==0){
      console.warn('The passphrase is not specified in the .env file.  This is just a warning as some certificates do not require it.');
    }
  }

  const config = {
    appRoot: __dirname, // required config
    swaggerSecurityHandlers: {
      APIKey: (req, securityDefinition, accessToken, cb) => {
        var ai = new AcceleratorInst(req);
        if(ai.isLocalHost){
          return cb(null);
        }
        var accessDenied={ "message":'Access Denied.', 'details':null};
        if (accessToken) {
          accelerator.authenticate(securityDefinition["x-audience"], accessToken)
            .then(() => cb(null))
            .catch((err) => {
              if(process.env.errorDetails=='true'){
                accessDenied.details = err.message;
              }
              req.res.status(403).json(accessDenied);
              req.res.end();
              return;});
        }else {
            req.res.status(403).json({ "message":'Access Denied. No Token.'});
            req.res.end();
            return;
        }
      },
    },
  };

  if(hasHttps){

    var options = {
      cert: fs.readFileSync(process.env.certificateFile),
      key: fs.readFileSync(process.env.keyFile),
      passphrase:process.env.passphrase,
      agent:false,
      rejectUnauthorized:false
    };

    https_app = restify.createServer(options);
    accelerator.registerSwaggerRestifyApplication(https_app,httpsPort,autoWireOptions,config,verbose,SwaggerRestify,restify);
    accelerator.registerSwaggerRestifyApplication(app,port,autoWireOptions,config,verbose,SwaggerRestify,restify);
  }else{
    accelerator.registerSwaggerRestifyApplication(app,port,autoWireOptions,config,verbose,SwaggerRestify,restify);
  }
}

/* istanbul ignore next */
const stop = function(){
  if(app!= null){
    app.close();
  }

  if(https_app!=null){
    https_app.close();
  }
}

run();

module.exports = {app, https_app, run, stop};
