/*** DATA ***/
let url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

/*** GRAPH ***/

/* positionner le graph */
let margin = {
    top: 200,
    right: 60,
    bottom: 30,
    left: 60
  },
  width = 920 - margin.left - margin.right,
  height = 630 - margin.top - margin.bottom;

/* AXE x */
let x = d3.scaleLinear()
  .range([0, width]);
/* AXE y */
let y = d3.scaleTime()
  .range([0, height]);

/* On détermine la couleur des points affichés, voir doc : https://observablehq.com/@d3/d3-scaleordinal*/
let color = d3.scaleOrdinal([`#d63031`, `#55efc4`]);

/* format du temps */
let timeFormat = d3.timeFormat("%M:%S"); /* affiché en minutes + secondes */

/* échelle des axes */
let xAxis = d3.axisBottom(x).tickFormat(d3.format("d")) /* doc : https://bl.ocks.org/mbostock/9764126 */
let yAxis = d3.axisLeft(y).tickFormat(timeFormat)

/* on définit la fenêtre ( tooltip ) qui s'affiche en hover sur les points */
let div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("opacity", 0);

/* svg graph */
let svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("class", "graph")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/* affichage */
d3.json(url, (error, data) => {
  if (error) throw error;
  data.forEach((d) => {
    d.Place = +d.Place;
    let parsedTime = d.Time.split(':');
    d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
  });

  x.domain([d3.min(data, (d) => {
    return d.Year - 1;
  }),
           d3.max(data, (d) => {
    return d.Year + 1;
  })]);
  y.domain(d3.extent(data, (d) => {
    return d.Time;
  }));

/* abscisses */
  svg.append("g")
    .attr("class", "x axis")
    .attr("id","x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("class", "x-axis-label")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end")
    .text("Year");


  svg.append("g")
    .attr("class", "y axis")
    .attr("id","y-axis")
    .call(yAxis)
    .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Best Time (minutes)")

/* ordonnées */
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -160)
    .attr('y', -44)
    .style('font-size', 18)
    .text('Temps en minutes');

/* cercles */
  svg.selectAll(".dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 6)
    .attr("cx", (d) => {
      return x(d.Year);
    })
    .attr("cy", (d) => {
      return y(d.Time);
    })
    .attr("data-xvalue", (d) => {
      return d.Year;
    })
    .attr("data-yvalue", (d) => {
      return d.Time.toISOString();
    })
    .style("fill", (d) => {
      return color(d.Doping != "");
    })
    .on("mouseover", (d) => { /* données affichée dans le tooltip */
      div.style("opacity", .9);
      div.attr("data-year", d.Year)
      div.html(d.Name + ": " + d.Nationality + "<br/>"
              + "Année: " +  d.Year + ", Temps: " + timeFormat(d.Time) 
              + (d.Doping?"<br/><br/>" + d.Doping:""))
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", (d) => {
      div.style("opacity", 0);
    });

/* Titre */
  svg.append("text")
        .attr("id","title")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "30px") 
        .text("Le dopage dans les courses cyclistes professionnelles");
  
/* sous titre */
  svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2) + 25)
        .attr("text-anchor", "middle")  
        .style("font-size", "20px") 
        .text("Les 35 temps de montée les plus rapides de l'Alpe d'Huez");

/* légende du graph */
  let legend = svg.selectAll(".legend")
    .data(color.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("id", "legend")
    .attr("transform", (d, i) => {
      return "translate(0," + (height/2 - i * 20) + ")";
    });

  legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) {
      if (d) return "Les coureurs avec des allégations de dopage";
      else {
        return "Aucune allégation de dopage";
      };
    });
});