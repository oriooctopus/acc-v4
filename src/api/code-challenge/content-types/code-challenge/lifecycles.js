module.exports = {
  beforeCreate(event) {
    console.log("**** beforeCreate hook is activated! ****");
    const [eventTests, eventMetaTests] = [
      event.params.data.tests,
      event.params.data.MetaTest,
    ];
    runMetaTests(eventTests, eventMetaTests);
  },

  beforeUpdate(event) {
    console.log("**** beforeUpdate hook is activated! ****");
    const [eventTests, eventMetaTests] = [
      event.params.data.tests,
      event.params.data.MetaTest,
    ];
    runMetaTests(eventTests, eventMetaTests);
  },
};

// runMetaTestsNeed more specific name later, maybe use "validateInternalTests"
async function runMetaTests(eventTests, eventMetaTests) {
  const [tests, metaTests] = await Promise.all([
    getInternalTests(eventTests),
    getMetaTests(eventMetaTests),
  ]);

  tests.map((test) =>
    console.log("final test.internalTest: ", test.internalTest)
  );

  metaTests.map((metaTest) =>
    console.log("final metaTest caseCode: ", metaTest.caseCode)
  );

  return false;
}

async function getInternalTests(eventTests) {
  const internalTests = await strapi.db
    .query("challenge.code-challenge-test")
    .findMany({
      select: ["id", "internalTest"],
      where: {
        id: getCurrentTestIDs(eventTests),
      },
    });

  // console.log("internalTests: ", internalTests);
  return internalTests;
}

function getCurrentTestIDs(eventTests) {
  let currentTestIDs = [];
  eventTests.map((test) => {
    currentTestIDs.push(test.id);
  });
  // console.log("currentTestIDs: ", currentTestIDs);
  return currentTestIDs;
}

async function getMetaTests(eventMetaTests) {
  const MetaTests = await strapi.db.query("challenge.meta-test").findMany({
    select: ["id", "caseCode", "passes"],
    where: {
      id: getCurrentMetaIDs(eventMetaTests),
    },
  });

  // console.log("MetaTests: ", MetaTests);
  return MetaTests;
}

function getCurrentMetaIDs(eventMetaTests) {
  let metaIDs = [];
  eventMetaTests.map((metaTest) => {
    metaIDs.push(metaTest.id);
  });
  // console.log("metaIDs: ", metaIDs);
  return metaIDs;
}
