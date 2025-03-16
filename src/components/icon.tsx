import clsx from "clsx";
import React from "react";

import * as classNames from "src/components/icon.module.css";
import Instagram from "src/components/images/Instagram.svg";
import assertNever from "src/helpers/assertNever";

// All icons: https://fonts.google.com/icons?query=Material+Symbols
export enum IconName {
  ArrowLeft = "arrow_left_alt",
  ArrowRight = "arrow_right_alt",
  Close = "close",
  Instagram = "instagram",
  KeyboardArrowDown = "keyboard_arrow_down",
  KeyboardArrowRight = "keyboard_arrow_right",
  Menu = "menu",
}

type Props = {
  name: IconName;
  size?: "regular" | "small";
};

export default function Icon(props: Props): React.JSX.Element | null {
  const { name, size } = props;

  switch (name) {
    case IconName.ArrowLeft:
    case IconName.ArrowRight:
    case IconName.KeyboardArrowDown:
    case IconName.KeyboardArrowRight:
    case IconName.Close:
    case IconName.Menu: {
      return (
        <span className={clsx(classNames.icon, { [classNames.isSmall]: size === "small" })}>
          {name}
        </span>
      );
    }
    case IconName.Instagram: {
      return <img src={Instagram} width="20" height="20" />;
    }
    default: {
      assertNever(name);
      return null;
    }
  }
}
