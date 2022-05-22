const { insertPropertiesIf } = require("../utils/general");
const getChallenges = require("../utils/getChallenges");

const getRecommendedChallengeIdentifiers = async (sublessonIds) => {
  if (!sublessonIds.length) {
    return [];
  }

  const populatedSublessons = await strapi.entityService.findMany(
    "api::sublesson.sublesson",
    {
      filters: {
        id: sublessonIds,
      },
      populate: [
        "steps.codeChallenge",
        "steps.multipleChoiceChallenge",
        "steps.playground",
      ],
    }
  );

  // now you just need to put them in an object of just typename and id
  const final = populatedSublessons.flatMap(({ steps }) =>
    steps.map(({ codeChallenge, multipleChoiceChallenge, playground }) => {
      if (codeChallenge) {
        return {
          id: codeChallenge.id,
          typename: "CodeChallenge",
        };
      } else if (multipleChoiceChallenge) {
        return {
          id: multipleChoiceChallenge.id,
          typename: "multipleChoiceChallenge",
        };
      } else if (playground) {
        return {
          id: playground.id,
          typename: "Playground",
        };
      }

      throw new Error("undefined step");
    })
  );
  return final;
};

const getSublessonIds = async (lessonSlug) => {
  const populatedSublessons = await strapi.entityService.findMany(
    "api::sublesson.sublesson",
    {
      filters: {
        challengeMeta: {
          lesson: {
            slug: lessonSlug,
          },
        },
      },
    }
  );

  return (populatedSublessons || []).map(({ id }) => id);
};

module.exports = {
  responseDefinition: ({ nexus }) =>
    nexus.objectType({
      name: "GetPracticeChallengesResponse",
      description: "Custom object for getPracticeChallenges query",
      definition(t) {
        t.nonNull.list.field("allChallenges", {
          type: nexus.nonNull("ChallengeEntityUnion"),
        });
        t.nonNull.list.field("recommendedChallengeIdentifiers", {
          type: nexus.nonNull("UniqueChallengeIdentifier"),
        });
      },
    }),
  queryDefinition: ({ nexus, t }) => {
    t.field("getPracticeChallenges", {
      type: nexus.nonNull("GetPracticeChallengesResponse"),
      args: {
        lessonSlug: nexus.stringArg(),
        sublessonId: nexus.intArg(),
      },
    });
  },
  async resolve(_context, { sublessonId, lessonSlug }) {
    // TODO: later on use typing to enforce this intead
    if (sublessonId && lessonSlug) {
      throw new Error(
        "Please only provide info for a lesson or for a sublesson"
      );
    }

    const sublessonIds = sublessonId
      ? [sublessonId]
      : await getSublessonIds(lessonSlug);

    const recommendedChallengeIdentifiers =
      await getRecommendedChallengeIdentifiers(sublessonIds);

    return {
      allChallenges: await getChallenges({
        strapi,
        parameters: {
          populate: ["challengeMeta.sublesson", "challengeMeta.lesson"],
          filters: {
            challengeMeta: {
              ...insertPropertiesIf(sublessonIds.length, {
                sublesson: {
                  id: sublessonIds,
                },
              }),
              ...insertPropertiesIf(lessonSlug, {
                lesson: {
                  slug: lessonSlug,
                },
              }),
            },
          },
        },
      }),
      recommendedChallengeIdentifiers,
    };
  },
};
