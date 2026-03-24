import Poster from "./components/Poster";
import FilmStrip from "./components/FilmStrip";
import ThankYou from "./components/ThankYou";
import Giveaway from "./components/Giveaway";
import Roadmap from "./components/Roadmap";
import Footer from "./components/Footer";

export default function App() {
  return (
    <main>
      <Poster />
      <FilmStrip />
      <ThankYou />
      <Giveaway />
      <Roadmap />
      <FilmStrip />
      <Footer />
    </main>
  );
}
