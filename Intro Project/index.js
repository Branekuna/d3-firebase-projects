//udemy-d3-firebase-896f7
const svg = d3
  .select('.canvas')
  .append('svg')
  .attr('width', 600)
  .attr('height', 600);

// create margins & dimensions
const margin = { top: 20, right: 20, bottom: 100, left: 100 };
const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.top - margin.bottom;

const graph = svg
  .append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// create axes groups
const xAxisGroup = graph
  .append('g')
  .attr('transform', `translate(0, ${graphHeight})`);

const yAxisGroup = graph.append('g');

//set up scales
const y = d3.scaleLinear().range([graphHeight, 0]);

const x = d3
  .scaleBand()
  .range([0, graphWidth])
  .paddingInner(0.2)
  .paddingOuter(0.2);

// create axes and ticksOfScale
const xAxis = d3.axisBottom(x);
const yAxis = d3
  .axisLeft(y)
  .ticks(3)
  .tickFormat((d) => d + ' orders');

//update x axis text
xAxisGroup
  .selectAll('text')
  .attr('fill', 'orange')
  .attr('transform', 'rotate(-40)')
  .attr('text-anchor', 'end');

const t = d3.transition().duration(800);
//ON DATA EVENT UPDATE GRAPH
//update function
const update = (data) => {
  //updating domains for scales
  y.domain([0, d3.max(data, (d) => d.orders)]);
  x.domain(data.map((item) => item.name));

  // join the data to rects
  const rects = graph.selectAll('rect').data(data);

  //remove exit selection
  rects.exit().remove();

  //update current shapes in dom (already existing)
  rects
    .attr('width', x.bandwidth)
    .attr('fill', 'orange')
    .attr('x', (d) => x(d.name));
  //merge handles this below by merge(rects)
  /*.transition(t)
    .attr('height', (d) => graphHeight - y(d.orders))
    .attr('y', (d) => y(d.orders));*/

  // append the enter selection to the DOM
  rects
    .enter()
    .append('rect')
    .attr('height', 0)
    .attr('fill', 'orange')
    .attr('x', (d) => x(d.name))
    .attr('y', graphHeight)
    .merge(rects)
    .transition()
    .attrTween('width', widthTween) //all the mechanics determined by custom func
    .attr('y', (d) => y(d.orders))
    .attr('height', (d) => graphHeight - y(d.orders));

  //call the axes defined in setup above
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);
};

let data = [];
//MAIN
db.collection('dishes').onSnapshot((res) => {
  res.docChanges().forEach((change) => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    switch (change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        const index = data.findIndex((item) => item.id === doc.id);
        data[index] = doc;
        break;
      case 'removed':
        data = data.filter((item) => item.id !== doc.id);
        break;
      default:
        break;
    }
  });

  update(data);
});

// TWEENS
const widthTween = (d) => {
  //define interpolation
  //d3.interpolate returns a function called 'i'
  let i = d3.interpolate(0, x.bandwidth());

  //returns a function that takes in time ticker 't'
  return function (t) {
    //return the value from passing the ticker into interpolation
    return i(t);
  };
};
