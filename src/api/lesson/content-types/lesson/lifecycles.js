const enforceSortingOrder = require("../../../../utils/enforceSortingOrder");

module.exports = {
  async beforeUpdate(event) {
    const newSublessonChallengeIds = await enforceSortingOrder({
      entityTableName: "sublessons",
      orderedEntityIds: event.params.data.sublessons,
    });

    event.params.data.sublessons = newSublessonChallengeIds;
  },
};
