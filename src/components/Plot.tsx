import { LoadingOutlined } from '@ant-design/icons';
import { Config, Data, Layout, Template } from 'plotly.js';
import React from "react";
import Loadable from "react-loadable";
import styled from 'styled-components';
import { palette } from '../styles/palette';

/*
  documentation:
  https://plotly.com/javascript/basic-charts/
*/

interface PlotProps {
  height: number;
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>
  [key: string]: any;
}

const PlotContainer = styled.div<{ height: number }>`
  height: ${({ height }) => `${height}px`};
`;

const LoadingContainer = styled.div<{ height: number }>`
  height: ${({ height }) => `${height}px`};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Plot: React.FC<PlotProps> = ({ height, data, layout, config }) => {
  const LoadablePlot = Loadable({
    loader: () => import('react-plotly.js'),
    loading() {
      return (
        <LoadingContainer height={height}>
          <LoadingOutlined style={{ fontSize: '24px', color: palette.primary }} />
        </LoadingContainer>
      );
    },
  });

  return (
    <PlotContainer height={height}>
      <LoadablePlot
        data={data}
        layout={{
          template: plotlySimpleWhiteTemplate,
          margin: { t: 10, b: 10, l: 10, r: 10 },
          dragmode: false,
          xaxis: { fixedrange: true },
          yaxis: { fixedrange: true },
          ...layout,
        }}
        config={{
          displayModeBar: false,
          showTips: false,
          responsive: true,
          ...config,
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler
      />
    </PlotContainer>
  )
}

const plotlySimpleWhiteTemplate: Template = { data: { barpolar: [{ marker: { line: { color: "white", width: 0.5 }, pattern: { fillmode: "overlay", size: 10, solidity: 0.2 } }, type: "barpolar" }], bar: [{ error_x: { color: "rgb(36,36,36)", type: "data", array: [] }, error_y: { color: "rgb(36,36,36)", type: "data", array: [] }, marker: { line: { color: "white", width: 0.5 }, pattern: { fillmode: "overlay", size: 10, solidity: 0.2 } }, type: "bar" }], carpet: [{ type: "carpet" }], choropleth: [{ colorbar: { outlinewidth: 1, tickcolor: "rgb(36,36,36)", ticks: "outside" }, type: "choropleth" }], contourcarpet: [{ colorbar: { outlinewidth: 1, tickcolor: "rgb(36,36,36)", ticks: "outside" }, type: "contourcarpet" }], contour: [{ colorbar: { outlinewidth: 1, tickcolor: "rgb(36,36,36)", ticks: "outside" }, colorscale: [[0.0, "#440154"], [0.1111111111111111, "#482878"], [0.2222222222222222, "#3e4989"], [0.3333333333333333, "#31688e"], [0.4444444444444444, "#26828e"], [0.5555555555555556, "#1f9e89"], [0.6666666666666666, "#35b779"], [0.7777777777777778, "#6ece58"], [0.8888888888888888, "#b5de2b"], [1.0, "#fde725"]], type: "contour" }], heatmapgl: [{ colorbar: { outlinewidth: 1, tickcolor: "rgb(36,36,36)", ticks: "outside" }, colorscale: [[0.0, "#440154"], [0.1111111111111111, "#482878"], [0.2222222222222222, "#3e4989"], [0.3333333333333333, "#31688e"], [0.4444444444444444, "#26828e"], [0.5555555555555556, "#1f9e89"], [0.6666666666666666, "#35b779"], [0.7777777777777778, "#6ece58"], [0.8888888888888888, "#b5de2b"], [1.0, "#fde725"]], type: "heatmapgl" }], heatmap: [{ colorbar: { outlinewidth: 1, tickcolor: "rgb(36,36,36)", ticks: "outside" }, colorscale: [[0.0, "#440154"], [0.1111111111111111, "#482878"], [0.2222222222222222, "#3e4989"], [0.3333333333333333, "#31688e"], [0.4444444444444444, "#26828e"], [0.5555555555555556, "#1f9e89"], [0.6666666666666666, "#35b779"], [0.7777777777777778, "#6ece58"], [0.8888888888888888, "#b5de2b"], [1.0, "#fde725"]], type: "heatmap" }], histogram2dcontour: [{ colorbar: { outlinewidth: 1, tickcolor: "rgb(36,36,36)", ticks: "outside" }, colorscale: [[0.0, "#440154"], [0.1111111111111111, "#482878"], [0.2222222222222222, "#3e4989"], [0.3333333333333333, "#31688e"], [0.4444444444444444, "#26828e"], [0.5555555555555556, "#1f9e89"], [0.6666666666666666, "#35b779"], [0.7777777777777778, "#6ece58"], [0.8888888888888888, "#b5de2b"], [1.0, "#fde725"]], type: "histogram2dcontour" }], histogram2d: [{ colorbar: { outlinewidth: 1, tickcolor: "rgb(36,36,36)", ticks: "outside" }, colorscale: [[0.0, "#440154"], [0.1111111111111111, "#482878"], [0.2222222222222222, "#3e4989"], [0.3333333333333333, "#31688e"], [0.4444444444444444, "#26828e"], [0.5555555555555556, "#1f9e89"], [0.6666666666666666, "#35b779"], [0.7777777777777778, "#6ece58"], [0.8888888888888888, "#b5de2b"], [1.0, "#fde725"]], type: "histogram2d" }], histogram: [{ marker: { line: { color: "white", width: 0.6 } }, type: "histogram" }], mesh3d: [{ colorbar: { outlinewidth: 1, tickcolor: "rgb(36,36,36)", ticks: "outside" }, type: "mesh3d" }], parcoords: [{ line: {}, type: "parcoords" }], pie: [{ automargin: true, type: "pie" }], scatter3d: [{ line: {}, marker: { colorbar: { outlinewidth: 1, tickcolor: "rgb(36,36,36)", ticks: "outside" } }, type: "scatter3d" }], scattercarpet: [{ marker: { colorbar: { outlinewidth: 1, tickcolor: "rgb(36,36,36)", ticks: "outside" } }, type: "scattercarpet" }], scattergeo: [{ marker: { colorbar: { outlinewidth: 1, tickcolor: "rgb(36,36,36)", ticks: "outside" } }, type: "scattergeo" }], scattergl: [{ marker: { colorbar: { outlinewidth: 1, tickcolor: "rgb(36,36,36)", ticks: "outside" } }, type: "scattergl" }], scattermapbox: [{ marker: { colorbar: { outlinewidth: 1, tickcolor: "rgb(36,36,36)", ticks: "outside" } }, type: "scattermapbox" }], scatterpolargl: [{ marker: { colorbar: { outlinewidth: 1, tickcolor: "rgb(36,36,36)", ticks: "outside" } }, type: "scatterpolargl" }], scatterpolar: [{ marker: { colorbar: { outlinewidth: 1, tickcolor: "rgb(36,36,36)", ticks: "outside" } }, type: "scatterpolar" }], scatter: [{ marker: { colorbar: { outlinewidth: 1, tickcolor: "rgb(36,36,36)", ticks: "outside" } }, type: "scatter" }], scatterternary: [{ marker: { colorbar: { outlinewidth: 1, tickcolor: "rgb(36,36,36)", ticks: "outside" } }, type: "scatterternary" }], surface: [{ colorbar: { outlinewidth: 1, tickcolor: "rgb(36,36,36)", ticks: "outside" }, colorscale: [[0.0, "#440154"], [0.1111111111111111, "#482878"], [0.2222222222222222, "#3e4989"], [0.3333333333333333, "#31688e"], [0.4444444444444444, "#26828e"], [0.5555555555555556, "#1f9e89"], [0.6666666666666666, "#35b779"], [0.7777777777777778, "#6ece58"], [0.8888888888888888, "#b5de2b"], [1.0, "#fde725"]], type: "surface" }], table: [{ type: "table" }] }, layout: { colorway: ["#1F77B4", "#FF7F0E", "#2CA02C", "#D62728", "#9467BD", "#8C564B", "#E377C2", "#7F7F7F", "#BCBD22", "#17BECF"], font: { family: "Source Sans Pro", color: "rgb(36,36,36)", size: 16 }, geo: { bgcolor: "white", lakecolor: "white", landcolor: "white", showlakes: true, showland: true, subunitcolor: "white" }, hoverlabel: { align: "left" }, hovermode: "closest", mapbox: { style: "light" }, paper_bgcolor: "white", plot_bgcolor: "white", polar: { angularaxis: { gridcolor: "rgb(232,232,232)", linecolor: "rgb(36,36,36)", showgrid: false, showline: true, ticks: "outside" }, bgcolor: "white", radialaxis: { gridcolor: "rgb(232,232,232)", linecolor: "rgb(36,36,36)", showgrid: false, showline: true, ticks: "outside" } }, scene: { xaxis: { backgroundcolor: "white", gridcolor: "rgb(232,232,232)", gridwidth: 2, linecolor: "rgb(36,36,36)", showbackground: true, showgrid: false, showline: true, ticks: "outside", zeroline: false, zerolinecolor: "rgb(36,36,36)" }, yaxis: { backgroundcolor: "white", gridcolor: "rgb(232,232,232)", gridwidth: 2, linecolor: "rgb(36,36,36)", showbackground: true, showgrid: false, showline: true, ticks: "outside", zeroline: false, zerolinecolor: "rgb(36,36,36)" }, zaxis: { backgroundcolor: "white", gridcolor: "rgb(232,232,232)", gridwidth: 2, linecolor: "rgb(36,36,36)", showbackground: true, showgrid: false, showline: true, ticks: "outside", zeroline: false, zerolinecolor: "rgb(36,36,36)" } }, ternary: { aaxis: { gridcolor: "rgb(232,232,232)", linecolor: "rgb(36,36,36)", showgrid: false, showline: true, ticks: "outside" }, baxis: { gridcolor: "rgb(232,232,232)", linecolor: "rgb(36,36,36)", showgrid: false, showline: true, ticks: "outside" }, bgcolor: "white", caxis: { gridcolor: "rgb(232,232,232)", linecolor: "rgb(36,36,36)", showgrid: false, showline: true, ticks: "outside" } }, title: { x: 0.05 }, xaxis: { automargin: true, gridcolor: "rgb(232,232,232)", linecolor: "rgb(36,36,36)", showgrid: false, showline: true, ticks: "outside", title: { standoff: 15 }, zeroline: false, zerolinecolor: "rgb(36,36,36)" }, yaxis: { automargin: true, gridcolor: "rgb(232,232,232)", linecolor: "rgb(36,36,36)", showgrid: false, showline: true, ticks: "outside", title: { standoff: 15 }, zeroline: false, zerolinecolor: "rgb(36,36,36)" } } }

export default Plot
