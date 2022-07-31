module.exports = {
  queryDefinition: ({ nexus, t }) => {
    t.field("getLessonBySlug", {
      type: "LessonEntity",
      args: {
        slug: nexus.stringArg(),
      },
    });
  },
  // async resolve(...everything) {
  async resolve(_, { slug }) {
    const lessons = await strapi.entityService.findMany("api::lesson.lesson", {
      filters: {
        slug,
      },
      populate: ["*"],
    });
    return lessons[0];
  },
};
