const pMap = require("p-map");
const { removeEmpty } = require("../code-challenge/general");
const { runTestEvaluator } = require("../code-challenge/test-evaluator");

module.exports = {
  beforeCreate(event) {
    // runMetaTests(event.params.data.tests, event.params.data.MetaTest);
  },

  beforeUpdate(event) {
    // runMetaTests(event.params.data.tests, event.params.data.MetaTest);
    // console.log(JSON.stringify(event));
    // console.log(
    //   "event.params.data.tests line13 lifecycles.js: ",
    //   event.params.data.tests
    // );
    runTests(
      event.params.data.tests,
      event.params.data.MetaTest,
      event.params.data.internalLabel
    );
  },
};

// runMetaTestsNeed more specific name later, maybe use "validateInternalTests"
async function runMetaTests(eventTests, eventMetaTests) {
  console.log("---runMetaTests: ----");
  const [internalTests, metaTests] = await Promise.all([
    getInternalTests(eventTests),
    getMetaTests(eventMetaTests),
  ]);

  console.log("final internalTests: ", internalTests);
  console.log("final metaTests: ", metaTests);

  // console.log("m1: ", metaTests[0].caseCode);
  // console.log("m1 passes: ", metaTests[0].passes);
  // console.log("test1: ", internalTests[0].internalTest);

  for (let i = 0; i < metaTests.length; i++) {
    for (let j = 0; j < internalTests.length; j++) {
      const result = eval(
        metaTests[i].caseCode + internalTests[j].internalTest
      );
      console.log(result);
      if (result === metaTests[i].passes) {
        console.log(`meta${i + 1} test${j + 1} Success: "true" ${result}`);
      } else if (result !== metaTests[i].passes) {
        console.log(`meta${i + 1} test${j + 1} Error: "false" ${result}`);
      }
    }
  }

  // For next part of feature: return some type of eval using internalTests & metaTests
  return false;
}

const executeTests = async (code, tests, expectPasses = true) => {
  return pMap(tests?.filter(removeEmpty) || [], async (test) => {
    const { label, internalTest } = test;
    // console.log("test name: ", test);
    const newTest = { pass: true, label, internalTest };
    // console.log("newTest name: ", newTest);

    const { pass, error } = await runTestEvaluator({
      internalTest,
      code,
      expectPasses,
    });
    // test passes, then fails..? Time for debugger
    // metaTest "Passing Example" SUCCESS. Expected: true and received: true
    // elem.error:  undefined undefined
    // ***error*** ReferenceError: lovesPizza is not defined

    console.log("***label***", label);
    console.log("***internalTest***", internalTest);
    console.log("***code***", code);
    console.log("***pass***", pass);
    // We should suppress this deeper??
    // console.log("***error***", error);

    if (!pass) {
      // @ts-expect-error will fix later
      const { message, stack } = error;

      newTest.pass = false;
      newTest.error = message + "\n" + stack;
      newTest.stack = stack;
    }
    // show metaTest + InternalTest Results
    // console.log("***newTest***", newTest);
    return newTest;
  });
};

async function runTests(eventTests, eventMetaTests, challengeLabel) {
  console.log("---runTests: ----");
  const [internalTests, metaTests] = await Promise.all([
    getInternalTests(eventTests),
    getMetaTests(eventMetaTests),
  ]);
  console.log("code-challenge: ", challengeLabel);
  console.log("CLEAN & SORTED internalTests: ", internalTests);
  console.log("metaTests: ", metaTests);

  let results;
  for (let i = 0; i < metaTests.length; i++) {
    results = await executeTests(
      [metaTests[i].caseCode],
      internalTests,
      metaTests[i].passes
    );

    // Errors on MetaTests.pass === false are OKAY! Need to be suppressed earlier...?
    // console.log(
    //   "results = await executeTests() == [{newTest1}, {newTest2}]",
    //   results
    // );

    results.map(({ error, pass }, index) => {
      console.log("wahhhh!");
      console.log(index, (error || "").substring(0, 20), pass);
    });
    let testCounter = 1;

    results.map((result) => {
      console.log(`\nmetaTest (${i + 1}), internalTest ${testCounter++},`);

      if (
        result.pass === metaTests[i].passes &&
        typeof result.error === "string"
      ) {
        console.log(
          `metaTest "${metaTests[i].label}" SUCCESS. Expected: ${metaTests[i].passes} and received: ${result.pass}`,
          `\nFailing Example triggered: \n"${result.error.substring(0, 120)}"`
        );
      } else if (result.pass !== metaTests[i].passes) {
        console.log(
          `metaTest "${metaTests[i].label}" FAILED. Expected: ${metaTests[
            i
          ].passes
            .toString()
            .toUpperCase()} but received: ${result.pass
            .toString()
            .toUpperCase()}`
        );

        console.log("result.error: ", typeof result.error, result.error);

        // console.log(`metaTest code: `, metaTests[i].caseCode);
        // console.log(`test "${result.label}"`);
        // console.log(`internalTest "${result.internalTest}"`);
        // console.log("results = await executeTests()", results);
      } else if (result.pass === metaTests[i].passes) {
        // the "easy fix" pros: don't need to edit test-evaluator, cons: create error, then suppress it.
        // result.error = undefined;
        console.log(
          `metaTest "${metaTests[i].label}" SUCCESS. Expected: ${metaTests[i].passes} and received: ${result.pass}`
        );
      }
    });
  }
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
