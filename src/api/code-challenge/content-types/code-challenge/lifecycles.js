const pMap = require("p-map");
const { removeEmpty } = require("../code-challenge/general");
const { runTestEvaluator } = require("../code-challenge/test-evaluator");
const { handleInternalLabel } = require("../../../../utils/general");
const pick = require("lodash/pick");

const iterateMetaTests = async (eventTests, eventMetaTests, challengeLabel) => {
  const [internalTests, metaTests] = await Promise.all([
    getInternalTests(eventTests),
    getMetaTests(eventMetaTests),
  ]);
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
      const {
        label: internalTestLabel,
        internalTestCode: internalTestCode,
        id: internalTestId,
      } = internalTest;

      // console.log("<internalTest pMap> ", internalTest);
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
        short: {
          description: null,
          ...pick(testEvaluatorResults, ["description"]),
        },
        long: {
          challengeLabel,
          metaTestId,
          internalTestId,
          internalTestLabel,
          userPassed: null,
          evalResultType: null,
          ...pick(testEvaluatorResults, [
            "evalResultType",
            "userPassed",
            "error",
          ]),
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

  // Originally, the content of internalTest === internalTestCode in strapi.
  // I renamed internalTest to internalTestCode for clarity in lifecycles.js & test-evaluator.ts
  // This renamed variable makes: (internalTestCode vs internalTestLabel vs internalTestId) the children of internalTestPackage

  return internalTests
    .map((internalTestPackage) => {
      internalTestPackage.internalTestCode = internalTestPackage.internalTest;
      delete internalTestPackage.internalTest;
      return internalTestPackage;
    })
    .sort(compareIds);
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
  // const internalLabel = await getInternalLabel(event);
  // event.params.data.internalLabel = internalLabel;
  iterateMetaTests(
    event.params.data.tests,
    event.params.data.MetaTest,
    event.params.data.internalLabel
  );
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
