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

const getChallengeData = (url, additionalProps) =>
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
  }).then(({ data }) =>
    data.map(({ id, attributes }) => ({
      ...attributes,
      id,
      ...additionalProps,
    }))
  );

const Cell = ({ children, noLink, id, type }) => {
  const link = `/content-manager/collectionType/api::${type}.${type}/${id}`;

  return (
    <Td>
      {noLink ? (
        <Typography textColor="neutral800">{children}</Typography>
      ) : (
        <Link to={link}>
          <Typography textColor="neutral800">{children}</Typography>
        </Link>
      )}
    </Td>
  );
};

const HomePage = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    Promise.all([
      getChallengeData("/code-challenges", { type: "code-challenge" }),
      getChallengeData("/multiple-choice-challenges", {
        type: "multiple-choice-challenge",
      }),
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
                <Typography variant="sigma">Type</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Name</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Lesson</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Sublesson</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Internal Notes</Typography>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedResults.map(
              ({ challengeMeta, id, internalNotes, name, type }) => (
                <Tr key={id} style={{ cursor: "pointer" }}>
                  {/**
                   * Gets rid of first-of-type styling. Eventually we'll put
                   * a checkbox here
                   */}
                  <Td />
                  {/* TODO: make passing in the id unnecessary */}
                  <Cell id={id} type={type}>
                    {id}
                  </Cell>
                  <Cell id={id} type={type}>
                    {/**
                     * Use a utility (maybe lodash has one) to convert the
                     * kebab case to a title case automatically
                     */}
                    {type === "code-challenge"
                      ? "Code Challenge"
                      : "Multiple Choice Challenge"}
                  </Cell>
                  <Cell id={id} type={type}>
                    {name || "Example Name"}
                  </Cell>
                  <Cell id={id} type={type}>
                    {getLessonName(challengeMeta)}
                  </Cell>
                  <Cell id={id} type={type}>
                    {challengeMeta?.sublesson?.data?.attributes?.name}
                  </Cell>
                  <Cell id={id} type={type}>
                    {internalNotes}
                  </Cell>
                </Tr>
              )
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default memo(HomePage);
