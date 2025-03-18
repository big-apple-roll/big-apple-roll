import clsx from "clsx";
import { graphql, PageProps, useStaticQuery } from "gatsby";
import React, { useCallback, useState } from "react";

import IconButton from "src/components/buttons/iconButton";
import LinkButton from "src/components/buttons/linkButton";
import { IconName } from "src/components/icon";
import * as classNames from "src/components/layouts/pageLayout.module.css";
import PageLayoutNav from "src/components/layouts/pageLayoutNav";

type Props = {
  children: React.ReactNode;
};

export default function PageLayout(props: Omit<PageProps, "children"> & Props): React.JSX.Element {
  const { location, children } = props;

  const { index } = useStaticQuery<Queries.LayoutQuery>(graphql`
    query Layout {
      index: markdownRemark(relativePath: { eq: "index/index.md" }) {
        ...IndexFragment
      }
    }
  `);

  const [showMenu, setShowMenu] = useState(false);

  const handleClickMenu = useCallback(() => {
    setShowMenu(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setShowMenu(false);
  }, []);

  return (
    <>
      <header className={classNames.header}>
        <div className={clsx(classNames.headerContent, classNames.content)}>
          <LinkButton internalHref="/" noDecoration>
            <span className={classNames.headerLogo}>{index?.frontmatter?.title ?? ""}</span>
          </LinkButton>
          <div className={classNames.desktopNav}>
            <PageLayoutNav location={location} />
          </div>
          <div className={classNames.mobileMenu}>
            <IconButton iconName={IconName.Menu} onClick={handleClickMenu}></IconButton>
          </div>
        </div>
      </header>
      <main className={clsx(classNames.main, classNames.content)}>{children}</main>
      {showMenu ? (
        <div className={classNames.mobileNav}>
          <div className={classNames.mobileNavClose}>
            <IconButton iconName={IconName.Close} onClick={handleCloseMenu} />
          </div>
          <LinkButton internalHref="/" noDecoration onClick={handleCloseMenu}>
            <span className={classNames.headerLogo}>{index?.frontmatter?.title ?? ""}</span>
          </LinkButton>
          <PageLayoutNav location={location} mobile onClick={handleCloseMenu} />
        </div>
      ) : null}
    </>
  );
}
