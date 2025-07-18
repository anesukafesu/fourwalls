
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Star, ExternalLink } from 'lucide-react';
import ChatWithAgentButton from '@/components/Properties/ChatWithAgentButton';

interface AgentContactCardProps {
  agent: any;
  agentRating: number | null;
  propertyId: string;
  propertyTitle: string;
  agentId: string;
  isOtherUser: boolean;
  isNotSignedIn: boolean;
  onSignInToContact: () => void;
  onAgentClick: () => void;
}

const AgentContactCard = ({
  agent,
  agentRating,
  propertyId,
  propertyTitle,
  agentId,
  isOtherUser,
  isNotSignedIn,
  onSignInToContact,
  onAgentClick
}: AgentContactCardProps) => {
  const renderStars = (rating: number, size = 'h-4 w-4') => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${size} ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const truncateBio = (bio: string, maxLength: number = 120) => {
    if (!bio) return '';
    if (bio.length <= maxLength) return bio;
    return bio.substring(0, maxLength).trim() + '...';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Agent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={agent.avatar_url || ''} />
            <AvatarFallback>
              {agent.full_name ? agent.full_name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900">{agent.full_name || 'Real Estate Agent'}</h4>
            <p className="text-sm text-gray-600">Listing Agent</p>
            {agentRating && (
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center">
                  {renderStars(Math.round(agentRating))}
                </div>
                <span className="text-sm text-gray-600">
                  {agentRating}/5
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Agent Bio */}
        {agent.bio && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              {truncateBio(agent.bio)}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={onAgentClick}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Profile
          </Button>
          
          {isOtherUser ? (
            <ChatWithAgentButton 
              propertyId={propertyId}
              propertyTitle={propertyTitle}
              agentId={agentId}
              variant="default"
              size="default"
            />
          ) : isNotSignedIn ? (
            <div className="text-center">
              <p className="text-gray-600 mb-3 text-sm">Sign in to contact the agent</p>
              <Button onClick={onSignInToContact} className="w-full">
                Sign in to contact agent
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentContactCard;
