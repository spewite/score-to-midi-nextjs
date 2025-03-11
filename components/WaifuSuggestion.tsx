import { Info } from "lucide-react";
import { Card } from "./ui/card";

const WaifuSuggestion = () => {

  return (
    <Card className="flex justify-center items-center mt-5 p-4 gap-2 w-full md:w-3/4">
      <Info className="h-7 w-7 text-primary" />
      <p>The image you uploaded has too low resolution. Try using
        <a className="text-primary" href="https://www.waifu2x.net/" target="_blank"> Waifu2x </a>
        to upscale the image (you may need to use it twice).</p>
    </Card>
  )

}

export default WaifuSuggestion;