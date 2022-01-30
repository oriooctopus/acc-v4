const GET_LAST_ROW_QUERY =
  "currval(pg_get_serial_sequence('sublessons', 'id'));";
const sublessonLessonLinkFields = ["lesson_id", "sublesson_id"];
// had trouble with serializing these so removing them for now
const temporaryIgnore = ["created_at", "updated_at", "published_at"];
const fieldsToIgnore = ["id", ...sublessonLessonLinkFields, ...temporaryIgnore];

const getLastInsertedRowId = async () => {
  const result = await strapi.db.connection.raw(`
    SELECT ${GET_LAST_ROW_QUERY}
  `);
  return result.rows[0].currval;
};

module.exports = {
  async beforeUpdate(event) {
    const lessonId = event.params.where.id;

    const { rows: sublessonChallenges } = await strapi.db.connection.raw(`
      SELECT *
        FROM sublessons
        JOIN sublessons_lesson_links
          ON sublessons_lesson_links.sublesson_id = sublessons.id
          WHERE sublessons_lesson_links.lesson_id = ${lessonId}
    `);

    if (!sublessonChallenges.length) {
      return;
    }

    const sublessonChallengeFields = Object.keys(sublessonChallenges[0]);
    const fieldsToRetain = sublessonChallengeFields.filter(
      (field) => !fieldsToIgnore.includes(field)
    );

    const newSublessonChallengeIds = [];
    const orderedSublessonIds = event.params.data.sublessons;

    // TODO: no need to do anything if the order isn't different
    // const orderHasChanged = orderedSublessonIds.length ===

    /**
     * loop through the INTENDED ORDER. We're creating new sublessonChallenges
     * according to the intended order
     */
    for (const sublessonChallengeId of orderedSublessonIds) {
      // find the corresponding existing data for the sublessonChallenge
      const currentSublessonChallenge = sublessonChallenges.find(
        ({ id }) => id == sublessonChallengeId
      );
      // generate a string of the values for the sql
      const fieldsString = fieldsToRetain
        .map((field) => `"${field}"`)
        .join(",");
      const valuesString = fieldsToRetain
        .map((field) => {
          const value = currentSublessonChallenge[field];
          if (typeof value === "string") {
            return `'${value.replace(/'/g, "''")}'`;
          } else if (value === undefined || value === null) {
            return "null";
          }

          return value;
        })
        .join(",");

      // create a new sublessonChallenge
      await strapi.db.connection.raw(`
        INSERT INTO sublessons (${fieldsString}) VALUES (${valuesString});
      `);
      const newRowId = await getLastInsertedRowId();

      newSublessonChallengeIds.push(newRowId);
      // Points the associated component to the newly created id instead of the old one
      await strapi.db.connection.raw(`
          UPDATE sublessons_components
          SET entity_id = ${newRowId}
          WHERE entity_id = ${sublessonChallengeId}
        `);
    }

    const idsToDelete = sublessonChallenges.map(({ id }) => id);

    await strapi.db.connection.raw(`
      DELETE FROM sublessons
      WHERE id IN (${idsToDelete.join(", ")});
    `);

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
