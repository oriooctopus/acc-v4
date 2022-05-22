"use strict";
const getPracticeChallenges = require("./resolvers/getPracticeChallenges");
const nextLessonSlug = require("./resolvers/nextLessonSlug");

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
      types: [
        getPracticeChallenges.responseDefinition({ nexus }),
        nexus.objectType({
          name: "UniqueChallengeIdentifier",
          description:
            "An id and challenge type is necessary to locate an individual challenge",
          definition(t) {
            t.nonNull.int("id");
            t.nonNull.string("typename");
          },
        }),
        nexus.unionType({
          name: "ChallengeEntityUnion",
          description: "All possible challenge entity types",
          definition(t) {
            t.members(
              "CodeChallengeEntity",
              "MultipleChoiceChallengeEntity",
              "PlaygroundEntity"
            );
          },
          resolveType(item) {
            return item.__typename;
          },
        }),
        nexus.queryType({
          // nonNullDefaults: {
          //   input: true,
          //   output: true,
          // },
          definition(t) {
            nextLessonSlug.queryDefinition({ nexus, t });
            getPracticeChallenges.queryDefinition({ nexus, t });
          },
        }),
      ],
      resolvers: {
        Query: {
          getPracticeChallenges: { resolve: getPracticeChallenges.resolve },
          nextLessonSlug: { resolve: nextLessonSlug.resolve },
        },
      },
      resolversConfig: {
        "Query.nextLessonSlug": {
          auth: false,
        },
        "Query.getPracticeChallenges": {
          auth: false,
        },
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
