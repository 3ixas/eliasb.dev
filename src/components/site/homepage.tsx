import { About } from "@/components/board/about";
import { Board } from "@/components/board/board";
import { Contact } from "@/components/board/contact";
import { BoardFooter } from "@/components/board/footer";
import { BoardHeader } from "@/components/board/board-header";
import { Hero } from "@/components/board/hero";
import { Work } from "@/components/board/work";

export async function Homepage() {
  return (
    <div className="min-h-screen overflow-clip" id="top" tabIndex={-1}>
      <BoardHeader />
      <main id="main-content" tabIndex={-1}>
        <Hero />

        <Work />

        <Board />

        <About />

        <Contact />
      </main>

      <BoardFooter />
    </div>
  );
}
