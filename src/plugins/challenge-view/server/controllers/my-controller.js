'use strict';

module.exports = {
  index(ctx) {
    ctx.body = strapi
      .plugin('challenge-view')
      .service('myService')
      .getWelcomeMessage();
  },
};
