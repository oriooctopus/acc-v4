const __typenames = [
  {
    apiReference: "api::code-challenge.code-challenge",
    typename: "CodeChallengeEntity",
  },
  {
    apiReference: "api::multiple-choice-challenge.multiple-choice-challenge",
    typename: "MultipleChoiceChallengeEntity",
  },
  // {
  //   apiReference: "api::playground.playground",
  //   typename: "PlaygroundEntity",
  // },
];

const getTypenameWithoutEntity = (typename) =>
  typename.slice(0, typename.length - 6);

module.exports = async ({ strapi, parameters }) => {
  const challengeGroups = await Promise.all(
    __typenames.map(({ apiReference }) =>
      strapi.entityService.findMany(apiReference, parameters)
    )
  );

  return __typenames.flatMap(({ typename }, index) =>
    challengeGroups[index].map(({ id, ...challenge }) => {
      // TODO: is the typename thing really a manual process???
      return {
        id,
        attributes: {
          __typename: getTypenameWithoutEntity(typename),
        },
        /**
         *  TODO: Investigate why this isn't working when it
         *  goes inside of attributes!!
         */
        ...challenge,
        __typename: typename,
      };
    })
  );
};
