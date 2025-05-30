import React from "react"
import Container from "../../components/Container"
import Plot from "../../components/Plot"
import { palette } from "../../styles/palette"

const PlotDemo = () => {
  return (
    <>
      <Container size={16} centered >
        <h2>Plots</h2>
      </Container>

      <Container size={16} centered >
        <h3>Sales Data</h3>
      </Container>

      <Container >
        <Plot
          height={300}
          data={[
            {
              name: 'Sales',
              x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
              y: [10, 15, 13, 17, 18, 20, 19, 15, 16, 14],
              type: 'scatter',
              hovertemplate: '<b>Week %{x}</b><br>%{y} sold',
              marker: { color: palette.purple },
            }
          ]}
          layout={{
            xaxis: { title: { 'text': 'Week' }, fixedrange: true },
            yaxis: { title: { 'text': 'Products Sold' }, fixedrange: true },
          }}
        />
      </Container>
    </>
  )
}

export default PlotDemo
