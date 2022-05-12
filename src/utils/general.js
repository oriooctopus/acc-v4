/**
 * TODO:
 * This is pretty inefficient. Look into either simple or
 * more complex optimizations
 * Since it's a private field maybe we can just check if
 * it's present and only run this if it is present?
 */
const handleInternalLabel = async ({ sublesson, populateLesson = false }) => {
  if (!sublesson) {
    return;
  } else if (sublesson.internalLabel === undefined) {
    /**
     * since internalLabel is a private field, we don't
     * need to populate it on public requests
     */
    return;
  } else if (typeof sublesson.internalLabel === "string") {
    /**
     * Avoid unnecessarily recalculating the internalLabel
     */
    return;
  }

  let { lesson, name: sublessonName } = sublesson;

  if (populateLesson) {
    const populatedSublesson = await strapi.db
      .query("api::sublesson.sublesson")
      .findOne({
        where: {
          id: sublesson.id,
        },
        populate: ["lesson"],
      });
    lesson = populatedSublesson.lesson;
  }

  sublesson.internalLabel = lesson
    ? `${lesson.name} - ${sublessonName}`
    : `Unassigned - ${sublessonName}`;
};

function insertPropertiesIf(condition, properties) {
  return condition ? properties : {};
}

module.exports = {
  handleInternalLabel,
  insertPropertiesIf,
};
