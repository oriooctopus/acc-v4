module.exports = {
  beforeCreate(event) {
    console.log("**** beforeCreate hook is activated! ****");
    // console.log("This is the JSON event object:", JSON.stringify(event));
    console.log("This is the event object:", event);
    console.log("This is the metaTest Object:", event.params.data);
    console.log("This is the metaTest Object:", event.params.data.MetaTest[0]);
    console.log("current test id: ", event.params.data.tests[0].id);

    async function runMetaTest() {
      const internalTest = await getInternalTest();
      const metaTest = await getMetaTest();
      console.log(`final result: ${metaTest} ${internalTest}`);

      // Error is not functioning correctly. See youtube.
      //   if (true) {
      //     throw new Error("MetaTest / internalTest behaving incorrectly");
      //   }
      return false;
    }

    runMetaTest();

    async function getInternalTest() {
      // ID of code-challenge Internal Test
      const currentID = event.params.data.tests[0].id;

      // Original Finding Internal Test
      const codeChallengeTestComponent = await strapi.db
        .query("challenge.code-challenge-test")
        .findOne({
          select: ["id", "internalTest"],
          where: {
            id: currentID,
          },
        });

      // Database Location of internalTest (code-challenge-test componenet)
      console.log(codeChallengeTestComponent);
      return codeChallengeTestComponent.internalTest;
    }

    // const internalTest = getInternalTest().then((value) =>
    //   console.log("getInternalTest(): ", value)
    // );

    async function getMetaTest() {
      // ID of code-challenge Internal Test
      const currentMetaID = event.params.data.MetaTest[0].id;

      // Original Finding Internal Test
      const MetaTestComponent = await strapi.db
        .query("challenge.meta-test")
        .findOne({
          select: ["id", "caseCode", "expectedResult"],
          where: {
            id: currentMetaID,
          },
        });

      // Database Location of internalTest (code-challenge-test componenet)
      //   console.log("MetaTestComponent: ", MetaTestComponent);
      return MetaTestComponent.caseCode;
    }

    // const metaTest = getMetaTest().then((value) =>
    //   console.log("getMetaTest(): ", value)
    // );
  },
};
