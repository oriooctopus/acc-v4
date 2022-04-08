import { fetchAPI } from "../../utils/api";
import React, { memo, useState, useEffect } from "react";
import { Typography } from "@strapi/design-system/Typography";
import { Link } from "@strapi/design-system/Link";
import { Table, Thead, Tbody, Tr, Td, Th } from "@strapi/design-system/Table";
import { BaseHeaderLayout, HeaderLayout } from "@strapi/design-system/Layout";
import { Box } from "@strapi/design-system/Box";

// gets the lesson or assumes the lesson and mentions that it comes from sublesson
const getLessonName = (challengeMeta) => {
  const lesson = challengeMeta?.lesson?.data?.attributes;
  const sublesson = challengeMeta?.sublesson?.data?.attributes;

  if (lesson) {
    return lesson?.name;
  } else if (sublesson) {
    /**
     * Rather than being set directly on the challengeMeta, the
     * lesson can be derived directly from the sublesson
     * */
    const sublessonLesson = sublesson?.lesson?.data?.attributes;

    if (sublessonLesson) {
      return sublessonLesson?.name;
    }
  }

  return "";
};

const getChallengeData = (url) =>
  fetchAPI(url, {
    populate: {
      challengeMeta: {
        populate: {
          sublesson: {
            populate: "*",
          },
          lesson: {
            populate: "*",
          },
        },
      },
    },
  }).then(({ data }) => data.map(({ attributes }) => attributes));

const HomePage = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    // fetchAPI("/code-challenges", {
    //   populate: {
    //     challengeMeta: {
    //       populate: {
    //         sublesson: {
    //           populate: "*",
    //         },
    //         lesson: {
    //           populate: "*",
    //         },
    //       },
    //     },
    //   },
    // }).then((results) =>
    //   setResults(results.data.map(({ attributes }) => attributes))
    // );
    Promise.all([
      getChallengeData("/code-challenges"),
      getChallengeData("/multiple-choice-challenges"),
    ]).then(([codeChallengeData, multipleChoiceChallengeData]) => {
      return setResults([...codeChallengeData, ...multipleChoiceChallengeData]);
    });
  }, []);
  const sortedResults = results.sort((a, b) => {
    const nameA = getLessonName(a.challengeMeta);
    const nameB = getLessonName(b.challengeMeta);

    if (nameA > nameB) {
      return -1;
    } else if (nameA < nameB) {
      return 1;
    }

    return 0;
  });

  return (
    <Box background="neutral100">
      <BaseHeaderLayout
        navigationAction={<Link to="/">Go back</Link>}
        title="Challenge Superview"
        subtitle={`${sortedResults.length} entries found`}
        as="h2"
      />
      <Box padding={8} background="neutral100">
        <Table colCount={2} rowCount={sortedResults.length}>
          <Thead>
            <Tr>
              <Th />
              <Th>
                <Typography variant="sigma">ID</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Internal Notes</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Lesson</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Sublesson</Typography>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedResults.map(({ challengeMeta, internalNotes, name }) => (
              <Tr>
                {/**
                 * Gets rid of first-of-type styling. Eventually we'll put
                 * a checkbox here
                 */}
                <Td />
                <Td>
                  <Typography textColor="neutral800">
                    {name || "Example Name"}
                  </Typography>
                </Td>
                <Td>
                  <Typography textColor="neutral800">
                    {internalNotes}
                  </Typography>
                </Td>
                <Td>
                  <Typography textColor="neutral800">
                    {getLessonName(challengeMeta)}
                  </Typography>
                </Td>
                <Td>
                  <Typography textColor="neutral800">
                    {challengeMeta?.sublesson?.data?.attributes?.name}
                  </Typography>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default memo(HomePage);
