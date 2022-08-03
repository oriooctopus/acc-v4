'use strict';

/**
 * playground router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::playground.playground');
