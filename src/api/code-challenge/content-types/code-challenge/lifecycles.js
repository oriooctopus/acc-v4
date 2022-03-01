module.exports = {
  beforeCreate(event) {
    runMetaTests(event.params.data.tests, event.params.data.MetaTest);
  },

  beforeUpdate(event) {
    runMetaTests(event.params.data.tests, event.params.data.MetaTest);
  },
};

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
