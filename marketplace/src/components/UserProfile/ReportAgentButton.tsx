import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ReportAgentButtonProps {
  agentId: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
}

const ReportAgentButton = ({ agentId, variant = 'outline', size = 'sm' }: ReportAgentButtonProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleReport = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/report/agent/${agentId}`);
  };

  return (
    <Button variant={variant} size={size} onClick={handleReport}>
      <Flag className="h-4 w-4 mr-1" />
      Report Agent
    </Button>
  );
};

export default ReportAgentButton;