import styled from "styled-components";

interface ContainerProps {
  size?: number;
  top?: number;
  bottom?: number;
  width?: number;
  centered?: boolean;
  flex?: boolean;
}

const Container = styled('div').withConfig({
  shouldForwardProp: (prop) => !['centered', 'flex', 'top', 'bottom', 'size', 'width'].includes(prop),
}).attrs<ContainerProps>(({
  size = 8, top, bottom, width, centered = false, flex = false,
}) => ({
  size,
  top: top ?? size,
  bottom: bottom ?? size,
  width,
  centered,
  flex,
})) <ContainerProps>`
  margin: auto;
  padding-top: ${props => props.top}px;
  padding-bottom: ${props => props.bottom}px;
  ${({ width }) => width && `
    max-width: ${width}px;
  `}
  ${({ centered }) => centered && `
    text-align: center;
    justify-content: center;
  `}
  ${({ flex }) => flex && `
    display: flex;
  `}
`

export default Container
