import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ReportListingButtonProps {
  propertyId: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
}

const ReportListingButton = ({ propertyId, variant = 'ghost', size = 'sm' }: ReportListingButtonProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleReport = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/report/listing/${propertyId}`);
  };

  return (
    <Button variant={variant} size={size} onClick={handleReport}>
      <Flag className="h-4 w-4 mr-1" />
      Report
    </Button>
  );
};

export default ReportListingButton;