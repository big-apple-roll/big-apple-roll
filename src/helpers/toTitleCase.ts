const toTitleCase = (string: string) => {
  return string.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
  );
};

export default toTitleCase;
