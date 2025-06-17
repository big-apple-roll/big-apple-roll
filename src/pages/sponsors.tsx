import clsx from "clsx";
import { graphql, useStaticQuery } from "gatsby";
import React, { useMemo } from "react";

import Image from "src/components/image";
import HeadLayout from "src/components/layouts/headLayout";
import { SponsorType } from "src/fragments/sponsors/sponsorFragment";
import isEnumValue from "src/helpers/isEnumValue";
import switchOn from "src/helpers/switchOn";
import * as classNames from "src/pages/sponsors.module.css";

export default function Sponsors(): React.JSX.Element {
  const { groupedSponsors } = useStaticQuery<Queries.SponsorsQuery>(graphql`
    query Sponsors {
      groupedSponsors: allMarkdownRemark(
        filter: { relativeDirectory: { eq: "sponsors" } }
        sort: { name: ASC }
      ) {
        group(field: { frontmatter: { type: SELECT } }) {
          nodes {
            ...SponsorFragment
          }
        }
      }
    }
  `);

  const sponsorsByType = useMemo(() => {
    return groupedSponsors.group.reduce<
      Record<SponsorType, Queries.SponsorsQuery["groupedSponsors"]["group"][number]["nodes"]>
    >(
      (acc, group) => {
        const { type } = group.nodes[0].frontmatter ?? {};
        if (!isEnumValue(type, SponsorType)) {
          return acc;
        }
        return {
          ...acc,
          [type]: group.nodes,
        };
      },
      {
        [SponsorType.Presenting]: [],
        [SponsorType.Saturday]: [],
        [SponsorType.Supporting]: [],
        [SponsorType.General]: [],
      },
    );
  }, [groupedSponsors.group]);

  return (
    <div>
      {Object.entries(sponsorsByType).map(([type, sponsors]) => {
        return (
          <React.Fragment key={type}>
            <h1>
              {isEnumValue(type, SponsorType)
                ? switchOn(type, {
                    [SponsorType.Presenting]: "Presenting sponsors",
                    [SponsorType.Saturday]: "Saturday night party sponsor",
                    [SponsorType.Supporting]: "Supporting sponsors",
                    [SponsorType.General]: "General sponsors",
                  })
                : ""}
            </h1>
            {type === SponsorType.Presenting ? (
              <p className={classNames.description}>
                A huge “Thank You” to all of our generous sponsors. BAR Sponsors donate money,
                services, skate equipment, accessories and free or discounted entrance fees to
                skating instruction & events. We use many of these items as prizes in our raffle,
                which help pay for the whole event. This event would not be possible without your
                support.
              </p>
            ) : null}
            {!sponsors.length ? <p>No sponsors yet</p> : null}
            <div
              className={clsx(
                classNames.sponsors,
                isEnumValue(type, SponsorType)
                  ? switchOn(type, {
                      [SponsorType.Presenting]: classNames.isPresenting,
                      [SponsorType.Saturday]: classNames.isSupporting,
                      [SponsorType.Supporting]: classNames.isSupporting,
                      [SponsorType.General]: null,
                    })
                  : null,
              )}
            >
              {sponsors.map((sponsor) => {
                const { title, url } = sponsor.frontmatter ?? {};
                const sponsorLogo = sponsor.linkedFiles?.[0] ?? sponsor.linkedImages?.[0];
                if (!title || !url || !sponsorLogo) {
                  // eslint-disable-next-line no-console
                  console.error("Missing logo", title, url, sponsorLogo);
                  return null;
                }

                return (
                  <a
                    key={sponsor.id}
                    className={classNames.sponsor}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Image className={classNames.sponsorLogo} src={sponsorLogo} alt={title} />
                  </a>
                );
              })}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function Head() {
  return <HeadLayout pageTitle="Sponsors" />;
}
