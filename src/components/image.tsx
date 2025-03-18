import { GatsbyImage, IGatsbyImageData } from "gatsby-plugin-image";
import React from "react";

type Props = {
  className?: string;
  src:
    | {
        publicURL?: string | null;
        childImageSharp?: {
          gatsbyImageData: IGatsbyImageData;
        } | null;
      }
    | null
    | undefined;
  alt: string | null | undefined;
};

export default function Image(props: Props): React.JSX.Element | null {
  const { className, src, alt } = props;

  if (src?.childImageSharp) {
    return (
      <GatsbyImage
        className={className}
        image={src.childImageSharp.gatsbyImageData}
        alt={alt ?? ""}
        objectFit="contain"
        draggable={false}
      />
    );
  } else if (src?.publicURL) {
    return <img className={className} src={src.publicURL} alt={alt ?? undefined} />;
  }

  return null;
}
