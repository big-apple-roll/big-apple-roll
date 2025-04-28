import { useMemo } from "react";

import { createDate, today } from "src/helpers/date/create";

const useShowSale = () => {
  const showSale = useMemo(() => {
    return today() < createDate({ year: 2025, month: 5, day: 5 });
  }, []);

  return showSale;
};

export default useShowSale;
