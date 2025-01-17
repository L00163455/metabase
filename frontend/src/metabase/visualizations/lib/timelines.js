import d3 from "d3";
import _ from "underscore";
import { ICON_PATHS } from "metabase/icon_paths";
import { stretchTimeseriesDomain } from "./apply_axis";
import timeseriesScale from "./timeseriesScale";

const EVENT_ICON_OFFSET_X = -16;
const EVENT_ICON_MARGIN_TOP = 10;
const EVENT_GROUP_COUNT_MARGIN_LEFT = 10;
const EVENT_GROUP_COUNT_MARGIN_TOP = EVENT_ICON_MARGIN_TOP + 8;

function isAxisEvent(event, [xAxisMin, xAxisMax]) {
  return (
    event.timestamp.isSame(xAxisMin) ||
    event.timestamp.isBetween(xAxisMin, xAxisMax) ||
    event.timestamp.isSame(xAxisMax)
  );
}

function getAxisEvents(events, xDomain) {
  return events.filter(event => isAxisEvent(event, xDomain));
}

function getEventGroups(events, xInterval) {
  return _.groupBy(events, event =>
    event.timestamp
      .clone()
      .startOf(xInterval.interval)
      .valueOf(),
  );
}

function getEventTicks(eventGroups) {
  return Object.keys(eventGroups).map(value => new Date(parseInt(value)));
}

function getTranslateFromStyle(value) {
  const style = value.replace("translate(", "").replace(")", "");
  const [x, y] = style.split(",");
  return [parseFloat(x), parseFloat(y)];
}

function getXAxis(chart) {
  return chart.svg().select(".axis.x");
}

function getEventAxis(xAxis, xDomain, xInterval, eventTicks) {
  const xAxisDomainLine = xAxis.select("path.domain").node();
  const { width: axisWidth } = xAxisDomainLine.getBoundingClientRect();
  xAxis.selectAll("event-axis").remove();

  const scale = timeseriesScale(xInterval)
    .domain(stretchTimeseriesDomain(xDomain, xInterval))
    .range([0, axisWidth]);

  const eventsAxisGenerator = d3.svg
    .axis()
    .scale(scale)
    .orient("bottom")
    .ticks(eventTicks.length)
    .tickValues(eventTicks);

  const eventsAxis = xAxis
    .append("g")
    .attr("class", "events-axis")
    .call(eventsAxisGenerator);

  eventsAxis.select("path.domain").remove();
  return eventsAxis;
}

function renderEventTicks(
  chart,
  { eventAxis, eventGroups, onHoverChange, onOpenTimelines },
) {
  const svg = chart.svg();
  const brush = svg.select("g.brush");
  const brushHeight = brush.select("rect.background").attr("height");

  svg.selectAll(".event-tick").remove();
  svg.selectAll(".event-line").remove();

  Object.values(eventGroups).forEach(group => {
    const defaultTick = eventAxis.select(".tick");
    const transformStyle = defaultTick.attr("transform");
    const [tickX] = getTranslateFromStyle(transformStyle);
    defaultTick.remove();

    const isOnlyOneEvent = group.length === 1;
    const iconName = isOnlyOneEvent ? group[0].icon : "star";

    const iconPath = ICON_PATHS[iconName].path
      ? ICON_PATHS[iconName].path
      : ICON_PATHS[iconName];
    const iconScale = iconName === "mail" ? 0.45 : 0.5;

    const eventPointerLine = brush
      .append("line")
      .attr("class", "event-line")
      .attr("x1", tickX)
      .attr("x2", tickX)
      .attr("y1", "0")
      .attr("y2", brushHeight);

    const eventIconContainer = eventAxis
      .append("g")
      .attr("class", "event-tick")
      .attr("transform", transformStyle);

    const eventIcon = eventIconContainer
      .append("path")
      .attr("class", "event-icon")
      .attr("d", iconPath)
      .attr("aria-label", `${iconName} icon`)
      .attr(
        "transform",
        `scale(${iconScale}) translate(${EVENT_ICON_OFFSET_X},${EVENT_ICON_MARGIN_TOP})`,
      );

    if (!isOnlyOneEvent) {
      eventIconContainer
        .append("text")
        .text(group.length)
        .attr(
          "transform",
          `translate(${EVENT_GROUP_COUNT_MARGIN_LEFT},${EVENT_GROUP_COUNT_MARGIN_TOP})`,
        );
    }

    eventIconContainer
      .on("mousemove", () => {
        onHoverChange({
          element: eventIcon.node(),
          timelineEvents: group,
        });
        eventIconContainer.classed("hover", true);
        eventPointerLine.classed("hover", true);
      })
      .on("mouseleave", () => {
        onHoverChange(null);
        eventIconContainer.classed("hover", false);
        eventPointerLine.classed("hover", false);
      })
      .on("click", () => {
        onOpenTimelines();
      });
  });
}

export function renderEvents(
  chart,
  {
    timelineEvents = [],
    xDomain,
    xInterval,
    isTimeseries,
    onHoverChange,
    onOpenTimelines,
  },
) {
  const xAxis = getXAxis(chart);
  if (!xAxis || !isTimeseries) {
    return;
  }

  const events = getAxisEvents(timelineEvents, xDomain);
  const eventGroups = getEventGroups(events, xInterval);
  const eventTicks = getEventTicks(eventGroups);
  if (!events.length) {
    return;
  }

  const eventAxis = getEventAxis(xAxis, xDomain, xInterval, eventTicks);
  renderEventTicks(chart, {
    eventAxis,
    eventGroups,
    onHoverChange,
    onOpenTimelines,
  });
}

export function hasEventAxis({ timelineEvents = [], xDomain, isTimeseries }) {
  if (!isTimeseries) {
    return false;
  }

  return timelineEvents.some(event => isAxisEvent(event, xDomain));
}
