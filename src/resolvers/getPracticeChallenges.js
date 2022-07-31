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

  const final = populatedSublessons.flatMap(({ steps, id: sublessonId }) =>
    steps.map(({ codeChallenge, multipleChoiceChallenge, playground }) => {
      if (codeChallenge) {
        return {
          id: codeChallenge.id,
          typename: "CodeChallenge",
        };
      } else if (multipleChoiceChallenge) {
        return {
          id: multipleChoiceChallenge.id,
          typename: "MultipleChoiceChallenge",
        };
      } else if (playground) {
        return {
          id: playground.id,
          typename: "Playground",
        };
      }

      throw new Error(
        `Sublesson of id ${sublessonId} contains a step that does not have any challenges`
      );
    })
  );
  return final;
};

const getSublessonIdsFromLesson = async (lessonSlug) => {
  const populatedSublessons = await strapi.entityService.findMany(
    "api::sublesson.sublesson",
    {
      populate: ["lesson"],
      filters: {
        lesson: {
          slug: lessonSlug,
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
      : lessonSlug
      ? await getSublessonIdsFromLesson(lessonSlug)
      : [];

    const recommendedChallengeIdentifiers =
      await getRecommendedChallengeIdentifiers(sublessonIds);

    return {
      allChallenges: await getChallenges({
        strapi,
        parameters: {
          populate: ["challengeMeta.sublesson", "challengeMeta.lesson"],
          filters: {
            $or: [
              insertPropertiesIf(sublessonIds.length, {
                challengeMeta: {
                  sublesson: {
                    id: sublessonIds,
                  },
                },
              }),
              insertPropertiesIf(lessonSlug, {
                challengeMeta: {
                  lesson: {
                    slug: lessonSlug,
                  },
                },
              }),
            ],
          },
        },
      }),
      recommendedChallengeIdentifiers,
    };
  },
};
