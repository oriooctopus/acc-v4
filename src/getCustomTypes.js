const completeChallenge = require("./resolvers/completeChallenge");
const getLessonBySlug = require("./resolvers/getLessonBySlug");
const getPracticeChallenges = require("./resolvers/getPracticeChallenges");
const nextLessonSlug = require("./resolvers/nextLessonSlug");

module.exports = (nexus) => [
  getPracticeChallenges.responseDefinition({ nexus }),
  nexus.queryType({
    definition(t) {
      nextLessonSlug.queryDefinition({ nexus, t });
      getLessonBySlug.queryDefinition({ nexus, t });
      getPracticeChallenges.queryDefinition({ nexus, t });
    },
  }),
  // nexus.mutationType({
  //   definition(t) {
  //     completeChallenge.queryDefinition({ nexus, t });
  //   },
  // }),
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
  nexus.enumType({
    name: "ChallengeType",
    description: "All possible challenge types",
    members: ["CodeChallenge", "MultipleChoiceChallenge", "Playground"],
  }),
  nexus.objectType({
    name: "UniqueChallengeIdentifier",
    description:
      "An id and challenge type is necessary to locate an individual challenge",
    definition(t) {
      t.nonNull.int("id");
      t.nonNull.field("typename", {
        type: nexus.nonNull("ChallengeType"),
      });
    },
  }),
];
