const { ValidationError } = require("../../../../utils/customErrors");

/**
 * This is to ensure that we don't accidentally forget
 * to have at least one correct option. Otherwise there
 * would be no way to pass the challenge
 */
const validateAtLeastOneOptionIsCorrect = async (event) => {
  const multipleChoiceOptionIds = event.params.data.options.map(({ id }) => id);
  const multipleChoiceOptions = await strapi.db
    .query("challenge.multiple-choice-options")
    .findMany({
      where: {
        id: {
          $in: multipleChoiceOptionIds,
        },
      },
    });
  const noCorrectOptionsExist = !multipleChoiceOptions.some(
    ({ isCorrect }) => isCorrect
  );

  if (noCorrectOptionsExist) {
    throw new ValidationError(
      "At least one multiple choice option must be correct"
    );
  }
};

const validate = async (event) => {
  await validateAtLeastOneOptionIsCorrect(event);
};

const beforeCreateOrUpdate = async (event) => {
  await validate(event);
};

module.exports = {
  async beforeCreate(event) {
    await beforeCreateOrUpdate(event);
  },

  async beforeUpdate(event) {
    await beforeCreateOrUpdate(event);
  },
};
