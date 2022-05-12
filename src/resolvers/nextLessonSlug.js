module.exports = {
  queryDefinition: ({ nexus, t }) => {
    t.field("nextLessonSlug", {
      type: "String",
      args: {
        currentLessonId: nexus.intArg(),
      },
    });
  },
  async resolve(_context, { currentLessonId }) {
    const result = await strapi.db.query("api::module.module").findOne({
      where: {
        id: 1,
      },
      populate: {
        moduleLessons: {
          populate: ["lesson"],
        },
      },
    });
    const { moduleLessons: lessons } = result;
    const currentLessonIndex = lessons.findIndex(
      ({ lesson: { id } }) => id === currentLessonId
    );

    if (currentLessonIndex === -1) {
      throw new Error(`Lesson of id ${currentLessonId} not found`);
    }

    if (currentLessonIndex === lessons.length - 1) {
      return null;
    }

    return lessons[currentLessonIndex + 1].lesson.slug;
  },
};
