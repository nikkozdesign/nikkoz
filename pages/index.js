import About from "../components/sections/About";
import TypesOfWork from "../components/sections/TypesOfWork";
import Projects from "../components/sections/Projects";
import Process from "../components/sections/Process";
import Playground from "../components/sections/Playground";
import Footer from "../components/sections/Footer";

export default function Home() {
  return (
    <main>
      <div style={{ height: "100vh" }} />
      <About />
      <TypesOfWork />
      <Projects />
      <Process />
      <Playground />
      <Footer />
    </main>
  );
}
