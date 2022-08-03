'use strict';

/**
 * playground service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::playground.playground');
