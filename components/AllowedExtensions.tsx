import { Badge } from './ui/badge';

interface AllowedExtensionsProps {
  allowedExtensions: string[];
}

export const AllowedExtensions: React.FC<AllowedExtensionsProps> = ({allowedExtensions}) => {
  
  return (
    <div className="gap-2 flex my-2 flex-wrap justify-center">
      {allowedExtensions.map(extension => <Badge
        key={extension}
        variant={'outline'}>{extension}</Badge>)}
    </div>
  );
};