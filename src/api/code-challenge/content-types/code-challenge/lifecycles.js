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

const executeTests = async (code, tests) => {
  return pMap(tests?.filter(removeEmpty) || [], async (test) => {
    const { label, internalTest } = test;
    // console.log("test name: ", test);
    const newTest = { pass: true, label, internalTest };
    // console.log("newTest name: ", newTest);

    const { pass, error } = await runTestEvaluator({
      internalTest,
      code,
    });

    if (!pass) {
      // @ts-expect-error will fix later
      const { message, stack } = error;

      newTest.pass = false;
      newTest.error = message + "\n" + stack;
      newTest.stack = stack;
    }

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
  console.log("internalTests: ", internalTests);
  console.log("metaTests: ", metaTests);

  let results;
  for (let i = 0; i < metaTests.length; i++) {
    results = await executeTests([metaTests[i].caseCode], internalTests);
    // console.log("results = await executeTests()", results);

    results.map(({ error, pass }, index) => {
      console.log("wahhhh!");
      console.log(index, (error || "").substring(0, 20), pass);
    });
    let testCounter = 1;

    results.map((elem) => {
      console.log(`\nmetaTest (${i + 1}), internalTest ${testCounter++},`);

      if (elem.pass === metaTests[i].passes) {
        console.log(
          `metaTest "${metaTests[i].label}" SUCCESS. Expected: ${metaTests[i].passes} and received: ${elem.pass}`
        );
        // console.log(`metaTest code: `, metaTests[i].caseCode);
        // console.log(`test "${elem.label}"`);
        // console.log(`internalTest "${elem.internalTest}"`);
      } else if (elem.pass !== metaTests[i].passes) {
        console.log(
          `metaTest "${metaTests[i].label}" FAILED. Expected: ${metaTests[
            i
          ].passes
            .toString()
            .toUpperCase()} but received: ${elem.pass.toString().toUpperCase()}`
        );
        console.log(`metaTest code: `, metaTests[i].caseCode);
        console.log(`test "${elem.label}"`);
        console.log(`internalTest "${elem.internalTest}"`);
        console.log("results = await executeTests()", results);
      }
    });
  }
  return results;
}

async function getInternalTests(eventTests) {
  // console.log("eventTests:", eventTests);
  const internalTests = await strapi.db
    .query("challenge.code-challenge-test")
    .findMany({
      select: ["id", "internalTest", "label"],
      where: {
        id: eventTests.map(({ id: testId }) => testId),
      },
    });
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
