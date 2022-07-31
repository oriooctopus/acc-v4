"use strict";
const getCustomTypes = require("./getCustomTypes");
const completeChallenge = require("./resolvers/completeChallenge");
const getPracticeChallenges = require("./resolvers/getPracticeChallenges");
const nextLessonSlug = require("./resolvers/nextLessonSlug");
const getLessonBySlug = require("./resolvers/getLessonBySlug");

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    const extensionService = strapi.plugin("graphql").service("extension");

    const extension = ({ nexus }) => ({
      types: getCustomTypes(nexus),
      resolvers: {
        Query: {
          getPracticeChallenges: { resolve: getPracticeChallenges.resolve },
          nextLessonSlug: { resolve: nextLessonSlug.resolve },
          getLessonBySlug: { resolve: getLessonBySlug.resolve },
        },
        // Mutation: {
        //   completeChallenge: { resolve: completeChallenge.resolve },
        // },
      },
      resolversConfig: {
        "Query.nextLessonSlug": {
          auth: false,
        },
        "Query.getPracticeChallenges": {
          auth: false,
        },
        "Query.getLessonBySlug": {
          auth: false,
        },
        // "Mutation.completeChallenge": {
        //   auth: false,
        // },
      },
    });
    extensionService.use(extension);
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {},
};
