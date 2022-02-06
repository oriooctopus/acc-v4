"use strict";

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
      // Nexus
      types: [
        nexus.queryType({
          definition(t) {
            t.field("nextLessonSlug", {
              type: "String",
              args: {
                currentLessonId: nexus.intArg(),
              },
            });
          },
        }),
      ],
      // GraphQL SDL
      typeDefs: `
          type Article {
              name: String
          }
      `,
      resolvers: {
        Query: {
          nextLessonSlug: {
            async resolve(_context, { currentLessonId }) {
              console.log("before");
              const result = await strapi.db
                .query("api::module.module")
                .findOne({
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
          },
        },
      },
      resolversConfig: {
        "Query.nextLessonSlug": {
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
