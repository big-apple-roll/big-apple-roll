import { graphql, useStaticQuery } from "gatsby";
import React, { useState } from "react";
import { FacebookEmbed, YouTubeEmbed } from "react-social-media-embed";

import TextButton from "src/components/buttons/textButton";
import useCallbackId from "src/components/hooks/useCallbackId";
import Icon, { IconName } from "src/components/icon";
import HeadLayout from "src/components/layouts/headLayout";
import * as classNames from "src/pages/gallery.module.css";

const YOUTUBE_REGEX = /youtube\.com/;
const FACEBOOK_REGEX = /facebook\.com/;

export default function Gallery(): React.JSX.Element {
  const { galleries } = useStaticQuery<Queries.GalleryQuery>(graphql`
    query Gallery {
      galleries: allMarkdownRemark(
        filter: { fileRelativeDirectory: { eq: "galleries" } }
        sort: { fields: { fileName: DESC } }
      ) {
        nodes {
          ...GalleryFragment
        }
      }
    }
  `);

  const [openedGallery, setOpenedGallery] = useState(galleries.nodes[0].id);

  const handleClick = useCallbackId(setOpenedGallery);

  return (
    <div>
      {galleries.nodes.map((node) => {
        return (
          <React.Fragment key={node.id}>
            <TextButton id={node.id} onClick={handleClick}>
              <h2>
                <Icon
                  name={
                    node.id === openedGallery
                      ? IconName.KeyboardArrowDown
                      : IconName.KeyboardArrowRight
                  }
                />{" "}
                {node.fileName}
              </h2>
            </TextButton>
            {node.id === openedGallery ? (
              <div className={classNames.gallery}>
                {node.frontmatter?.links?.map((link) => {
                  if (!link) {
                    return null;
                  }

                  if (YOUTUBE_REGEX.test(link)) {
                    return <YouTubeEmbed key={link} url={link} />;
                  }
                  if (FACEBOOK_REGEX.test(link)) {
                    return <FacebookEmbed key={link} url={link} />;
                  }

                  return null;
                })}
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function Head(): React.JSX.Element {
  return <HeadLayout pageTitle="Gallery" />;
}
