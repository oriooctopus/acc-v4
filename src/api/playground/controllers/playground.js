'use strict';

/**
 *  playground controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::playground.playground');
