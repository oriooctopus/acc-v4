const { executeTests } = require("../code-challenge/test-executor");
const { handleInternalLabel } = require("../../../../utils/general");
const { compareIds } = require("../code-challenge/utils");

const runMetaTests = async ({ eventTests, eventMetaTests, challengeLabel }) => {
  const [internalTests, metaTests] = await Promise.all([
    getInternalTests(eventTests),
    getMetaTests(eventMetaTests),
  ]);

  for (let i = 0; i < metaTests.length; i++) {
    const metaCaseCode = metaTests[i].caseCode;
    const metaLabel = metaTests[i].label;
    const metaTestId = metaTests[i].id;
    const evalResultShouldBe = metaTests[i].passes;

    let metaTestResult = await executeTests({
      metaCaseCode,
      internalTests,
      metaLabel,
      challengeLabel,
      metaTestId,
      evalResultShouldBe,
    });

    // Feature: MetaTest Final Results being logged to Console.
    console.log(
      `\n\n<"${metaTests[i].label}" METATEST #${metaTests[i].id}> \n\n`,
      metaTestResult,
      "\n\n"
    );
  }
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
