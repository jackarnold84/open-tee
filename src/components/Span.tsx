import styled from "styled-components";

interface SpanProps {
  size?: number;
  left?: number;
  right?: number;
}

const Span = styled('span').withConfig({
  shouldForwardProp: (prop) => !['size', 'left', 'right'].includes(prop),
}).attrs<SpanProps>(({ size = 4, left, right }) => ({
  size,
  left: left ?? size,
  right: right ?? size,
})) <SpanProps>`
  padding-left: ${props => props.left}px;
  padding-right: ${props => props.right}px;
`;

export default Span;
