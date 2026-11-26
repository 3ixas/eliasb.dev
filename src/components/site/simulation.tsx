import "@/app/simulation.css";
import { SimulationPlot } from "@/components/site/simulation-plot";
import { simulationCopy } from "@/content/stretch/simulation-copy";

/**
 * The BNP Paribas simulation (DESIGN.md "Figures", #457): its heading, the plot and its controls, its description (read
 * with the figure, shown nowhere) and its caption. It sits on the BNP Paribas Role story, under The role. Styles are in
 * simulation.css.
 */
export function Simulation() {
  const { title, caption, description } = simulationCopy;
  return (
    <figure className="sim" aria-labelledby="sim-title" aria-describedby="sim-description">
      <h3 id="sim-title" className="sim__title">
        {title}
      </h3>
      <SimulationPlot />
      {/* The caption says what the engines do; the description says what is drawn. */}
      <p id="sim-description" hidden>
        {description}
      </p>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
