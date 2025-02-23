import { Badge } from "./ui/badge"

export const AllowedExtensions: React.FC<{allowedExtensions: string[]}> = ({allowedExtensions}) => {
  
  return (
    <div className="gap-2 flex my-2">
      {allowedExtensions.map(extension => <Badge key={extension} variant={"outline"}>{extension}</Badge>)}
    </div>
  )
}