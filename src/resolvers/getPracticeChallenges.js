const { insertPropertiesIf } = require("../utils/general");
const getChallenges = require("../utils/getChallenges");

module.exports = {
  queryDefinition: ({ nexus, t }) => {
    t.field("getPracticeChallenges", {
      type: "GetPracticeChallengesResponse",
      args: {
        lessonSlug: nexus.stringArg(),
        sublessonId: nexus.intArg(),
      },
    });
  },
  async resolve(_context, { sublessonId, lessonSlug }) {
    console.log("yoo?");
    return {
      allChallenges: (
        await getChallenges({
          strapi,
          includeTypename: true,
          parameters: {
            populate: ["challengeMeta.sublesson", "challengeMeta.lesson"],
            filters: {
              challengeMeta: {
                ...insertPropertiesIf(sublessonId, {
                  sublesson: {
                    id: sublessonId,
                  },
                }),
                ...insertPropertiesIf(lessonSlug, {
                  lesson: {
                    id: lessonSlug,
                  },
                }),
              },
            },
          },
        })
      ).flat(),
      recommendedChallenges: sublessonId
        ? await strapi.db.query("api::sublesson.sublesson").findOne({
            where: {
              id: sublessonId,
            },
          })
        : [],
    };
  },
};
