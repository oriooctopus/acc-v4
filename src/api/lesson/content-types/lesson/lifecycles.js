const enforceSortingOrder = require("../../../../utils/enforceSortingOrder");

module.exports = {
  async beforeUpdate(event) {
    const newSublessonIds = event.params.data.sublessons;

    /**
     * Publish events don't include any sublessonIds, which
     * actually seems like a bug, but at least for now we need
     * to account for it and make sure that we don't
     * accidentally run the sorting order function in this case
     */
    if (!newSublessonIds) {
      return;
    }

    const newSublessonChallengeIds = await enforceSortingOrder({
      entityTableName: "sublessons",
      orderedEntityIds: event.params.data.sublessons,
    });

    event.params.data.sublessons = newSublessonChallengeIds;
  },
};
