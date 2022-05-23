const pMap = require("p-map");
const { handleInternalLabel } = require("../../../../utils/general");

module.exports = {
  async afterFindOne(event) {
    await handleInternalLabel({
      sublesson: event.result,
    });
  },

  async afterFindMany(event) {
    await pMap(
      event.result,
      (sublesson) => handleInternalLabel({ sublesson, populateLesson: true }),
      { concurrency: 20 }
    );
  },
};
