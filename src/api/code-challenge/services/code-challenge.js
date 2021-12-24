'use strict';

/**
 * code-challenge service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::code-challenge.code-challenge');
