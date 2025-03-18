import React from "react";

type Props = {
  html: string | null | undefined;
  className?: string;
};

export default function HTML(props: Props): React.JSX.Element | null {
  const { html, className } = props;

  return <div dangerouslySetInnerHTML={{ __html: html ?? "" }} className={className}></div>;
}
