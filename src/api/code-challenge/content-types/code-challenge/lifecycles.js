const { handleInternalLabel } = require("../../../../utils/general");

// runMetaTestsNeed more specific name later, maybe use "validateInternalTests"
async function runMetaTests(eventTests, eventMetaTests) {
  const [internalTests, metaTests] = await Promise.all([
    getInternalTests(eventTests),
    getMetaTests(eventMetaTests),
  ]);

  // console.log("final internalTests: ", internalTests);
  // console.log("final metaTests: ", metaTests);

  // For next part of feature: return some type of eval using internalTests & metaTests
  return false;
}

async function getInternalTests(eventTests) {
  const internalTests = await strapi.db
    .query("challenge.code-challenge-test")
    .findMany({
      select: ["id", "internalTest"],
      where: {
        id: eventTests.map(({ id: testId }) => testId),
      },
    });
  return internalTests;
}

async function getMetaTests(eventMetaTests) {
  const metaTests = await strapi.db.query("challenge.meta-test").findMany({
    select: ["id", "caseCode", "passes"],
    where: {
      id: eventMetaTests.map(({ id: metaId }) => metaId),
    },
  });
  return metaTests;
}

const beforeCreateOrUpdate = async (event) => {
  runMetaTests(event.params.data.tests, event.params.data.MetaTest);
};

module.exports = {
  async beforeCreate(event) {
    await beforeCreateOrUpdate(event);
  },

  async beforeUpdate(event) {
    await beforeCreateOrUpdate(event);
  },

  async afterFindOne(event) {
    if (!event.result) {
      return;
    }

    const challengeMeta = event.result.challengeMeta;
    if (challengeMeta) {
      /**
       * This is a temporary hack until
       * https://github.com/strapi/strapi/issues/13216 gets resolved
       */
      await handleInternalLabel({
        sublesson: challengeMeta.sublesson,
        populateLesson: true,
      });
    }
  },
};
