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

// runMetaTestsNeed more specific name later, maybe use "validateInternalTests"
async function runMetaTests(eventTests, eventMetaTests) {
  const [internalTests, metaTests] = await Promise.all([
    getInternalTests(eventTests),
    getMetaTests(eventMetaTests),
  ]);

  // console.log("final internalTests: ", internalTests);
  // console.log("final metaTests: ", metaTests);

  // For next part of feature: return some type of eval using internalTests & metaTests
  return false;
}

async function getInternalTests(eventTests) {
  const internalTests = await strapi.db
    .query("challenge.code-challenge-test")
    .findMany({
      select: ["id", "internalTest"],
      where: {
        id: eventTests.map(({ id: testId }) => testId),
      },
    });
  return internalTests;
}

async function getMetaTests(eventMetaTests) {
  const metaTests = await strapi.db.query("challenge.meta-test").findMany({
    select: ["id", "caseCode", "passes"],
    where: {
      id: eventMetaTests.map(({ id: metaId }) => metaId),
    },
  });
  return metaTests;
}

const beforeCreateOrUpdate = async (event) => {
  const internalLabel = await getInternalLabel(event);
  event.params.data.internalLabel = internalLabel;
  runMetaTests(event.params.data.tests, event.params.data.MetaTest);
};

module.exports = {
  async beforeCreate(event) {
    await beforeCreateOrUpdate(event);
  },

  async beforeUpdate(event) {
    await beforeCreateOrUpdate(event);
  },
};
