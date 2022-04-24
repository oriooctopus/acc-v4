const pMap = require("p-map");

/**
 * TODO:
 * This is pretty inefficient. Look into either simple or
 * more complex optimizations
 * Since it's a private field maybe we can just check if
 * it's present and only run this if it is present?
 */
const addInternalLabel = async (sublesson) => {
  const populatedSublesson = await strapi.db
    .query("api::sublesson.sublesson")
    .findOne({
      where: {
        id: sublesson.id,
      },
      populate: ["lesson"],
    });

  sublesson.internalLabel = populatedSublesson.lesson
    ? `${populatedSublesson.lesson.name} - ${sublesson.name}`
    : `Unassigned - ${sublesson.name}`;
};

module.exports = {
  async afterFindOne(event) {
    console.log("hey does this happen &*&*&>>????");
    addInternalLabel(event.data);
  },

  async afterFindMany(event) {
    console.log("hey does this happen &*&*&!!");
    // await pMap(event.results, addInternalLabel, { concurrency: 20 });
    await pMap(event.result, addInternalLabel, { concurrency: 20 });
    // event.result.forEach(addInternalLabel);
  },
};
