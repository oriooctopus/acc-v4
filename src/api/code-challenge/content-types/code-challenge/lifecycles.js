const pMap = require("p-map");
const { removeEmpty } = require("../code-challenge/general");
const { runTestEvaluator } = require("../code-challenge/test-evaluator");
const { handleInternalLabel } = require("../../../../utils/general");
const pick = require("lodash/pick");

const getInternalLabel = async (event) => {
  const {
    data: { challengeMeta, name },
  } = event.params;

  const defaultName = `Unassigned - ${name}`;
  const challengeMetaId = challengeMeta ? challengeMeta.id : undefined;

  if (!challengeMetaId) {
    return defaultName;
  }

  const { lesson } = await strapi.db.query("challenge.challenge-meta").findOne({
    where: {
      id: challengeMetaId,
    },
    populate: ["challengeMeta", "lesson"],
  });

  if (!lesson) {
    return defaultName;
  }

  return `${lesson.name} -- name`;
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
  evalResultShouldBe
) => {
  return pMap(
    internalTests?.filter(removeEmpty) || [],
    async (internalTest) => {
      const {
        label: internalTestLabel,
        internalTestCode: internalTestCode,
        id: internalTestId,
      } = internalTest;

      // console.log("<internalTest pMap> ", internalTest);

      let newTest = {
        description: null,
        userPassed: null,
        metaLabel,
        evalResult: null,
        evalResultShouldBe,
        resultType: null,
        internalTestLabel,
        challengeLabel,
        metaTestId,
        internalTestId,
        metaCaseCode,
        internalTestCode,
      };
      // console.log("newTest name: ", newTest);

      const testEvaluatorResults = await runTestEvaluator({
        metaCaseCode,
        internalTestCode,
        metaLabel,
        challengeLabel,
        metaTestId,
        internalTest,
        evalResultShouldBe,
      });
      newTest = {
        ...newTest,
        ...pick(testEvaluatorResults, [
          "description",
          "resultType",
          "evalResult",
          "userPassed",
        ]),
      };
      // newTest.description = description;
      // newTest.resultType = resultType;
      // newTest.evalResult = evalResult;
      // newTest.userPassed = userPassed;
      console.log("--- newTest--- lifecycles", newTest);
      if (testEvaluatorResults.error) {
        // @ts-expect-error will fix later
        const { message, stack } = testEvaluatorResults.error;
        // newTest.message = error.message;
        // newTest.stack = error.stack;
        // newTest.userPassed = false;
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
  evalResultShouldBe
) {
  let results = await executeTests(
    metaCaseCode,
    internalTests,
    metaTestLabel,
    challengeLabel,
    metaTestId,
    evalResultShouldBe
  );

  console.log("<RESULTS LIFECYCLES.JS>", results);

  let testCounter = 1;
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

const beforeCreateOrUpdate = async (event) => {
  const internalLabel = await getInternalLabel(event);
  // event.params.data.internalLabel = internalLabel;
  iterateMetaTests(
    event.params.data.tests,
    event.params.data.MetaTest,
    event.params.data.internalLabel
  );
  // runMetaTests(event.params.data.tests, event.params.data.MetaTest);
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
