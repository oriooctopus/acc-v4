module.exports = {
  beforeCreate(event) {
    console.log("**** beforeCreate hook is activated! ****");
    const eventData = event.params.data;
    runMetaTest(eventData);
  },

  beforeCreateMany(event) {
    console.log("**** beforeCreateMany hook is activated! ****");
    const eventData = event.params.data;
    runMetaTest(eventData);
  },

  beforeUpdate(event) {
    console.log("**** beforeUpdate hook is activated! ****");
    const eventData = event.params.data;
    runMetaTest(eventData);
  },

  beforeUpdateMany(event) {
    console.log("**** beforeUpdateMany hook is activated! ****");
    const eventData = event.params.data;
    runMetaTest(eventData);
  },
};

async function runMetaTest(eventData) {
  const tests = await getInternalTests(eventData);
  const metaTests = await getMetaTests(eventData);

  tests.forEach((test) =>
    console.log("final test.internalTest: ", test.internalTest)
  );

  metaTests.forEach((metaTest) =>
    console.log("final metaTest caseCode: ", metaTest.caseCode)
  );

  return false;
}

async function getInternalTests(eventData) {
  // Original Finding Internal Test
  const internalTests = await strapi.db
    .query("challenge.code-challenge-test")
    .findMany({
      select: ["id", "internalTest"],
      where: {
        id: {
          $gte: getCurrentTestID(eventData),
        },
      },
    });

  console.log("internalTests: ", internalTests);
  return internalTests;
}

function getCurrentTestID(eventData) {
  let testIDs = [];
  eventData.tests.forEach((test) => {
    testIDs.push(test.id);
  });
  const currentTestID = Math.min(...testIDs);
  console.log("currentTestID: ", currentTestID);
  return currentTestID;
}

async function getMetaTests(eventData) {
  // Original Finding Internal Test
  const MetaTests = await strapi.db.query("challenge.meta-test").findMany({
    select: ["id", "caseCode", "expectedResult"],
    where: {
      id: {
        $gte: getCurrentMetaID(eventData),
      },
    },
  });

  console.log("MetaTests: ", MetaTests);
  return MetaTests;
}

function getCurrentMetaID(eventData) {
  let metaIDs = [];
  eventData.MetaTest.forEach((metaTest) => {
    metaIDs.push(metaTest.id);
  });
  const currentMetaID = Math.min(...metaIDs);
  console.log("currentMetaID: ", currentMetaID);
  return currentMetaID;
}
