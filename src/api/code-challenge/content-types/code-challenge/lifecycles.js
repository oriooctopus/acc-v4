console.log("OUTSIDE OF THE LIFECYCLE");
module.exports = {
  beforeCreate(event) {
    // console.log("**** beforeCreate hook is activated! ****");
    // console.log("This is the JSON event object:", JSON.stringify(event));
    // console.log("This is the event object:", event);
    // console.log("This is the event.params.data:", event.params.data);
    // console.log("These are the Tests: ", event.params.data.tests);
    // console.log("These are the metaTests:", event.params.data.MetaTest);

    (async function runMetaTest() {
      const tests = await getInternalTests();
      const metaTests = await getMetaTests();

      tests.forEach((test) =>
        console.log("final test.internalTest: ", test.internalTest)
      );

      metaTests.forEach((metaTest) =>
        console.log("final metaTest caseCode: ", metaTest.caseCode)
      );

      return false;
    })();

    // runMetaTest();

    async function getInternalTests() {
      // Original Finding Internal Test
      const internalTests = await strapi.db
        .query("challenge.code-challenge-test")
        .findMany({
          select: ["id", "internalTest"],
          where: {
            id: {
              $gte: getCurrentTestID(),
            },
          },
        });

      // Database Location of internalTest (code-challenge-test componenet)
      console.log("internalTests: ", internalTests);
      return internalTests;
    }

    function getCurrentTestID() {
      let testIDs = [];
      event.params.data.tests.forEach((test) => {
        testIDs.push(test.id);
      });
      const currentTestID = Math.min(...testIDs);
      console.log("currentTestID: ", currentTestID);
      return currentTestID;
    }

    async function getMetaTests() {
      // Original Finding Internal Test
      const MetaTests = await strapi.db.query("challenge.meta-test").findMany({
        select: ["id", "caseCode", "expectedResult"],
        where: {
          id: {
            $gte: getCurrentMetaID(),
          },
        },
      });

      // Database Location of internalTest (code-challenge-test componenet)
      console.log("MetaTests: ", MetaTests);
      return MetaTests;
    }

    function getCurrentMetaID() {
      let metaIDs = [];
      event.params.data.MetaTest.forEach((metaTest) => {
        metaIDs.push(metaTest.id);
      });
      const currentMetaID = Math.min(...metaIDs);
      console.log("currentMetaID: ", currentMetaID);
      return currentMetaID;
    }
  },
};
