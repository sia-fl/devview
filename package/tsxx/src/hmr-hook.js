const http = require('http');

/**
 * @type {http.Server[]}
 */
let services = [];

const oldCreateServer = http.createServer;

http.createServer = requestListener => {
  const server = oldCreateServer.call(this, requestListener);
  services.push(server);
  return server;
};

const closeServices = () => {
  for (const service of services) {
    // noinspection JSUnresolvedReference
    service.close(err => {
      if (err) {
        console.log(err);
      }
    });
  }
  services = [];
};

const unblocks = () => {
  closeServices();
};

module.exports.closeServices = closeServices;

module.exports.unblocks = unblocks;
