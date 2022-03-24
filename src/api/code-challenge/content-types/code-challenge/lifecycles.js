const pMap = require("p-map");
const { removeEmpty } = require("../code-challenge/general");
const { runTestEvaluator } = require("../code-challenge/test-evaluator");

module.exports = {
  beforeCreate(event) {
    runTests(
      event.params.data.tests,
      event.params.data.MetaTest,
      event.params.data.internalLabel
    );
  },

  beforeUpdate(event) {
    iterateMetaTests(
      event.params.data.tests,
      event.params.data.MetaTest,
      event.params.data.internalLabel
    );
  },
};

const iterateMetaTests = async (eventTests, eventMetaTests, challengeLabel) => {
  const [internalTests, metaTests] = await Promise.all([
    getInternalTests(eventTests),
    getMetaTests(eventMetaTests),
  ]);
  console.log("<metaTests.length>", metaTests.length);
  console.log("<metaTests>", metaTests);
  console.log("<code-challenge>", challengeLabel);
  console.log("<internalTests>: ", internalTests);
  for (let i = 0; i < metaTests.length; i++) {
    runInternalTests(
      internalTests,
      metaTests[i].caseCode,
      challengeLabel,
      metaTests[i].label,
      metaTests[i].id,
      metaTests[i].passes
    );
  }
};

const executeTests = async (
  metaCaseCode,
  internalTests,
  metaLabel,
  challengeLabel,
  metaTestId,
  metaTestExpectPasses
) => {
  return pMap(
    internalTests?.filter(removeEmpty) || [],
    async (internalTest) => {
      const internalTestLabel = internalTest.label;
      const internalTestCode = internalTest.internalTestCode;
      const internalTestId = internalTest.id;
      // console.log("<internalTest pMap> ", internalTest);

      const newTest = {
        pass: true,
        metaTestExpectPasses,
        metaTestId,
        internalTestId,
        metaLabel,
        internalTestLabel,
        metaCaseCode,
        internalTestCode,
        description: null,
      };
      // console.log("newTest name: ", newTest);

      const { pass, error, description } = await runTestEvaluator({
        metaCaseCode,
        internalTestCode,
        metaLabel,
        challengeLabel,
        metaTestId,
        internalTest,
        metaTestExpectPasses,
      });
      newTest.description = description;

      if (!pass) {
        // @ts-expect-error will fix later
        const { message, stack } = error;
        // newTest.message = error.message;
        // newTest.stack = error.stack;
        newTest.pass = false;
        newTest.error = message;
        newTest.stack = stack;
      }
      // show metaTest + InternalTest Results
      // console.log(
      //   `---------------
      // \n<newTest.pass> ${newTest.pass},
      // \n <label> ${newTest.label},
      // \n <internalTestCode> ${newTest.internalTestCode},
      // \n <error type> ${typeof newTest.error}
      // \n--------------`
      // );
      return newTest;
    }
  );
};

async function runInternalTests(
  internalTests,
  metaCaseCode,
  challengeLabel,
  metaTestLabel,
  metaTestId,
  metaTestExpectPasses
) {
  let results = await executeTests(
    metaCaseCode,
    internalTests,
    metaTestLabel,
    challengeLabel,
    metaTestId,
    metaTestExpectPasses
  );

  console.log("<RESULTS LIFECYCLES.JS>", results);

  let testCounter = 1;
  // results.map((result) => {
  //   console.log(`\nmetaTest (${i + 1}), internalTest ${testCounter++},`);
  //   // Failing Example SUCCESS with Short Error
  //   if (
  //     result.pass === metaTests[i].passes &&
  //     typeof result.error === "string"
  //   ) {
  //     console.log(
  //       `\nmetaTest "${metaTests[i].label}" SUCCESS. Expected: ${metaTests[i].passes} and received: ${result.pass}`,
  //       `\nFailing Example triggered: \n"${result.error.substring(0, 200)}"`
  //     );
  //     // Passing & Failing Example FAIL --Redundant?
  //   } else if (result.pass !== metaTests[i].passes) {
  //     console.log(
  //       `\nmetaTest "${metaTests[i].label}" FAILED. Expected: ${metaTests[
  //         i
  //       ].passes
  //         .toString()
  //         .toUpperCase()} but received: ${result.pass
  //         .toString()
  //         .toUpperCase()}`
  //     );

  //     try {
  //       console.log(
  //         `\n<${typeof result.error}> FAIL triggered by: \n"${result.error.substring(
  //           0,
  //           200
  //         )}"`
  //       );
  //     } catch {
  //       console.log("<result.error> ", typeof result.error, result.error);
  //     }

  //     // Passing Example SUCCESS
  //   } else if (result.pass === metaTests[i].passes) {
  //     console.log(
  //       `\nmetaTest "${metaTests[i].label}" SUCCESS. Expected: ${metaTests[i].passes} and received: ${result.pass}`
  //     );
  //   }
  // });
  return results;
}

async function getInternalTests(eventTests) {
  // console.log("eventTests:", eventTests);
  const internalTests = await strapi.db
    .query("challenge.code-challenge-test")
    .findMany(
      // {}
      {
        select: ["id", "internalTest", "label"],
        where: {
          id: eventTests.map(({ id: testId }) => testId),
        },
      }
    );
  // console.log("FRESH N RAW INTERNAL TESTS: ", internalTests);
  // Rename internalTest to internalTestCode
  internalTests.map((internalTestPackage) => {
    internalTestPackage.internalTestCode = internalTestPackage.internalTest;
    delete internalTestPackage.internalTest;
  });
  // console.log("RENAMED INTERNAL TESTS: ", internalTests);
  return internalTests.sort(compareIds);
}

async function getMetaTests(eventMetaTests) {
  const metaTests = await strapi.db.query("challenge.meta-test").findMany({
    select: ["id", "caseCode", "passes", "label"],
    where: {
      id: eventMetaTests.map(({ id: metaId }) => metaId),
    },
  });
  return metaTests.sort(compareIds);
}

function compareIds(a, b) {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
}
