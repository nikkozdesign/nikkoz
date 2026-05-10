import About from "../components/sections/About";
import TypesOfWork from "../components/sections/TypesOfWork";
import Projects from "../components/sections/Projects";
import Process from "../components/sections/Process";

export default function Home() {
  return (
    <main>
      <div style={{ height: "100vh" }} />
      <About />
      <TypesOfWork />
      <Projects />
      <Process />
    </main>
  );
}
