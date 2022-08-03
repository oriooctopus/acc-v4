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
        nexus.objectType({
          name: "GetPracticeChallengesResponse",
          description: "Custom object for getPracticeChallenges query",
          definition(t) {
            t.list.field("allChallenges", { type: "ChallengeUnion" });
            t.list.int("recommendedChallenges");
          },
        }),
        nexus.unionType({
          name: "ChallengeUnion",
          description: "All possible challenge types",
          definition(t) {
            t.members("CodeChallenge", "MultipleChoiceChallenge", "Playground");
          },
          resolveType(item) {
            return item.challengeType;
          },
        }),
        nexus.queryType({
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
