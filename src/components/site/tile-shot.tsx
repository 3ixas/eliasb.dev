import Image from "next/image";
import type { ProjectImage } from "@/content/projects";

/** A project's screenshot as the Next project tile shows it: tilted by the tile's --tile-tilt, with its shadow. */
export function TileShot({ screenshot, sizes }: { screenshot: ProjectImage; sizes: string }) {
  return (
    <div className="stretch-tile__shot">
      <Image src={screenshot.src} alt={screenshot.alt} width={screenshot.width} height={screenshot.height} sizes={sizes} />
    </div>
  );
}
