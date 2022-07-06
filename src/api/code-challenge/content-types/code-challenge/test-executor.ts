const pMap = require("p-map");
const { removeEmpty } = require("../code-challenge/general");
const { runTestEvaluator } = require("../code-challenge/test-evaluator");

type executeTestsProps = {
  metaCaseCode: string;
  internalTests: Array<Object>;
  metaLabel: string;
  challengeLabel: string;
  metaTestId: number;
  evalResultShouldBe: boolean;
};

export const executeTests = async ({
  metaCaseCode,
  internalTests,
  metaLabel,
  challengeLabel,
  metaTestId,
  evalResultShouldBe,
}: executeTestsProps) => {
  return pMap(
    internalTests?.filter(removeEmpty) || [],
    async (internalTest: {
      label: string;
      internalTest: string;
      id: number;
    }) => {
      const internalTestLabel = internalTest.label;
      const internalTestCode = internalTest.internalTest;
      const internalTestId = internalTest.id;

      const testEvaluatorResults = await runTestEvaluator({
        metaCaseCode,
        internalTestCode,
        metaLabel,
        challengeLabel,
        metaTestId,
        internalTestId,
        evalResultShouldBe,
      });

      return {
        message: testEvaluatorResults.description,
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
