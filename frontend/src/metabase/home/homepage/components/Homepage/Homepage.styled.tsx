import {
  breakpointMinMedium,
  breakpointMinSmall,
} from "metabase/styled-components/theme";
import styled from "styled-components";

export const LandingRoot = styled.div`
  padding: 0 1rem;

  ${breakpointMinSmall} {
    padding: 0 2rem;
  }

  ${breakpointMinMedium} {
    padding: 0 4rem;
  }
`;