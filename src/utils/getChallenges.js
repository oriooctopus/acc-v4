const challengeTypes = [
  {
    apiReference: "api::code-challenge.code-challenge",
    typeName: "CodeChallenge",
  },
  {
    apiReference: "api::multiple-choice-challenge.multiple-choice-challenge",
    typeName: "MultipleChoiceChallenge",
  },
  {
    apiReference: "api::playground.playground",
    typeName: "Playground",
  },
];

module.exports = async ({ strapi, parameters, includeTypename }) => {
  const challengeGroups = await Promise.all(
    challengeTypes.map(({ apiReference }) =>
      strapi.entityService.findMany(apiReference, parameters)
    )
  );

  const final = includeTypename
    ? challengeTypes.flatMap(({ typeName }, index) =>
        challengeGroups[index].map((challenge) => {
          return {
            ...challenge,
            challengeType: typeName,
          };
        })
      )
    : t;
  return final;
};
