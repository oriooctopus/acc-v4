import { fetchAPI } from "../../utils/api";
import React, { memo } from "react";
// import PropTypes from 'prop-types';
import pluginId from "../../pluginId";

const HomePage = () => {
  // const test = await fetchAPI("/sublessons");
  // console.log("test", test);
  return (
    <div>
      <h1>{pluginId}&apos;s HomePage</h1>
      <p>Happy coding!!!!!</p>
    </div>
  );
};

export default memo(HomePage);
