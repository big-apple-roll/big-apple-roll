import { graphql, PageProps } from "gatsby";
import React from "react";
import { FacebookEmbed, YouTubeEmbed } from "react-social-media-embed";

import HeadLayout from "src/components/layouts/headLayout";
import Navigation from "src/components/navigation";
import * as classNames from "src/templates/galleryYearTemplate.module.css";

const YOUTUBE_REGEX = /youtube\.com/;
const FACEBOOK_REGEX = /facebook\.com/;

export type GalleryYearTemplateContext = {
  galleryYearId: string;
  previousGalleryYearId?: string;
  nextGalleryYearId?: string;
};

export const query = graphql`
  query GalleryYearTemplate(
    $galleryYearId: String!
    $previousGalleryYearId: String = ""
    $nextGalleryYearId: String = ""
  ) {
    galleryYear: markdownRemark(id: { eq: $galleryYearId }) {
      ...GalleryYearFragment
    }
    previousGalleryYear: markdownRemark(id: { eq: $previousGalleryYearId }) {
      ...GalleryYearFragment
    }
    nextGalleryYear: markdownRemark(id: { eq: $nextGalleryYearId }) {
      ...GalleryYearFragment
    }
  }
`;

export default function GalleryYearTemplate(
  props: PageProps<Queries.GalleryYearTemplateQuery, GalleryYearTemplateContext>,
): React.JSX.Element {
  const { data } = props;
  const { galleryYear, previousGalleryYear, nextGalleryYear } = data;

  if (!galleryYear) {
    return <div />;
  }

  return (
    <>
      <h1>Gallery</h1>
      <h2>{galleryYear.fileName}</h2>
      <div className={classNames.gallery}>
        {galleryYear.frontmatter?.links?.map((link) => {
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
      <Navigation
        previousSlug={previousGalleryYear?.slug ?? undefined}
        previousTitle={previousGalleryYear?.fileName ?? undefined}
        nextSlug={nextGalleryYear?.slug ?? undefined}
        nextTitle={nextGalleryYear?.fileName ?? undefined}
      ></Navigation>
    </>
  );
}

export function Head(
  props: PageProps<Queries.GalleryYearTemplateQuery, GalleryYearTemplateContext>,
): React.JSX.Element {
  const { data } = props;
  const { galleryYear } = data;
  return <HeadLayout pageTitle={`${galleryYear?.fileName} gallery`} />;
}
