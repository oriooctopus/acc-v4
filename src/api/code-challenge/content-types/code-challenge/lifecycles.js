const pMap = require("p-map");
const pick = require("lodash/pick");
const { removeEmpty } = require("../code-challenge/general");
const { runTestEvaluator } = require("../code-challenge/test-evaluator");
const { handleInternalLabel } = require("../../../../utils/general");
const { compareIds } = require("../code-challenge/utils");

const runMetaTests = async (eventParams) => {
  const { eventTests, eventMetaTests, challengeLabel } = eventParams;
  const [internalTests, metaTests] = await Promise.all([
    getInternalTests(eventTests),
    getMetaTests(eventMetaTests),
  ]);
  console.log("<internalTests after get1> ", internalTests);

  for (let i = 0; i < metaTests.length; i++) {
    let metaTestResult = await executeTests(
      metaTests[i].caseCode,
      internalTests,
      metaTests[i].label,
      challengeLabel,
      metaTests[i].id,
      metaTests[i].passes
    );

    // MetaTest Final Results being logged to Console.
    await console.log(
      `\n\n<"${metaTests[i].label}" METATEST #${metaTests[i].id}> \n\n`,
      metaTestResult,
      "\n\n"
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
      // const {
      //   label: internalTestLabel,
      //   internalTestCode,
      //   id: internalTestId,
      // } = internalTest;

      const internalTestLabel = internalTest.label;
      const internalTestCode = internalTest.internalTestCode;
      const internalTestId = internalTest.id;

      console.log("<internalTest after get2> ", internalTest);
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
      return {
        message: {
          description: testEvaluatorResults.description,
        },
        debugInfo: {
          challengeLabel,
          metaTestId,
          internalTestId,
          internalTestLabel,
          userPassed: testEvaluatorResults.userPassed,
          evalResultType: testEvaluatorResults.evalResultType,
          evalError: testEvaluatorResults.evalError,
        },
      };
    }
  );
};

async function getInternalTests(eventTests) {
  const internalTests = await strapi.db
    .query("challenge.code-challenge-test")
    .findMany({
      select: ["id", "internalTest", "label"],
      where: {
        id: eventTests.map(({ id: testId }) => testId),
      },
    });

  let sortedInternalTests = internalTests.sort(compareIds);

  console.log("<sortedInternalTests1>", sortedInternalTests);

  let internalTestPackages = internalTests.map((e) => {
    // console.log("<e> ", e);
    e.internalTestCode = e.internalTest;
    // delete e.internalTest;
    return e;
  });
  // .sort(compareIds);

  console.log("<sortedInternalTests2>", sortedInternalTests);

  // console.log("<internalTestPackages> ", internalTestPackages);

  return sortedInternalTests;
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

const beforeCreateOrUpdate = async (event) => {
  const eventParams = {
    eventTests: event.params.data.tests,
    eventMetaTests: event.params.data.MetaTest,
    challengeLabel: event.params.data.internalLabel,
  };
  runMetaTests(eventParams);
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
