const enforceSortingOrder = require("../../../../utils/enforceSortingOrder");

const sublessonLessonLinkFields = ["lesson_id", "sublesson_id"];
// had trouble with serializing these so removing them for now
const temporaryIgnore = ["created_at", "updated_at", "published_at"];
const fieldsToIgnore = ["id", ...sublessonLessonLinkFields, ...temporaryIgnore];

module.exports = {
  async beforeUpdate(event) {
    const newSublessonChallengeIds = await enforceSortingOrder({
      entityTableName: "sublessons",
      orderedEntityIds: event.params.data.sublessons,
    });

    // updates the intended order to use the newly created stuff~
    // setSublessonChallengeIds(newSublessonChallengeIds);
    event.params.data.sublessons = newSublessonChallengeIds;
    // SELECT * FROM sublessons_lesson_links WHERE lesson_id = ${lessonId}

    // const sublessonChallenges = await strapi.db.connection.raw(`
    //   SELECT * sublessons WHERE id =
    // `);
    // event.params.data.name = event.params.data.name + "7";
  },
};
