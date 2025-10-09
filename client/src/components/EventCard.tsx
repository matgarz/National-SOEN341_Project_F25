import { Calendar, Clock, MapPin, Users, Heart, Ticket, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "./ui/Button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
// import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  category: string;
  ticketType: 'free' | 'paid';
  price?: number;
  capacity: number;
  attendees: number;
  image: string;
  tags: string[];
  isBookmarked?: boolean;
  hasTicket?: boolean;
}

interface EventCardProps {
  event: Event;
  userRole: 'student' | 'organizer' | 'admin';
  onBookmark?: (eventId: string) => void;
  onClaimTicket?: (eventId: string) => void;
  onViewDetails?: (eventId: string) => void;
  onEdit?: (eventId: string) => void;
}

export function EventCard({ 
  event, 
  userRole, 
  onBookmark, 
  onClaimTicket, 
  onViewDetails, 
  onEdit 
}: EventCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Academic': 'bg-blue-100 text-blue-800',
      'Social': 'bg-green-100 text-green-800',
      'Sports': 'bg-orange-100 text-orange-800',
      'Cultural': 'bg-purple-100 text-purple-800',
      'Career': 'bg-gray-100 text-gray-800',
      'Workshop': 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getAvailabilityStatus = () => {
    const remaining = event.capacity - event.attendees;
    if (remaining === 0) return { text: 'Sold Out', color: 'text-red-600' };
    if (remaining < 10) return { text: `${remaining} left`, color: 'text-orange-600' };
    return { text: `${remaining} available`, color: 'text-green-600' };
  };

  const availability = getAvailabilityStatus();

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
        <div className="relative group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/*<ImageWithFallback
              src={event.image}
              alt={event.title}
              className="w-full h-48 object-cover transition-transform duration-300"
            />*/}
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {userRole === 'student' && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md backdrop-blur-sm"
                onClick={() => onBookmark?.(event.id)}
              >
                <motion.div
                  animate={{ 
                    scale: event.isBookmarked ? [1, 1.2, 1] : 1,
                    rotate: event.isBookmarked ? [0, -10, 10, 0] : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className={`h-4 w-4 transition-colors duration-200 ${
                    event.isBookmarked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                  }`} />
                </motion.div>
              </Button>
            </motion.div>
          )}
          <div className="absolute top-2 left-2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Badge className={`${getCategoryColor(event.category)} shadow-sm backdrop-blur-sm`}>
                {event.category}
              </Badge>
            </motion.div>
          </div>
        </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <h3 className="line-clamp-2">{event.title}</h3>
          {event.ticketType === 'paid' && event.price && (
            <Badge variant="outline" className="ml-2 shrink-0">
              ${event.price}
            </Badge>
          )}
          {event.ticketType === 'free' && (
            <Badge variant="outline" className="ml-2 shrink-0 text-green-600 border-green-200">
              Free
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(event.date)}</span>
          <Clock className="h-4 w-4 ml-2" />
          <span>{event.time}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{event.location}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{event.attendees} attending</span>
          </div>
          <span className={availability.color}>{availability.text}</span>
        </div>

        <div className="text-sm text-muted-foreground">
          <span>by {event.organizer}</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-4">
        {userRole === 'student' && (
          <>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full transition-all duration-200 hover:border-primary/50"
                onClick={() => onViewDetails?.(event.id)}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Details
              </Button>
            </motion.div>
            {!event.hasTicket && event.capacity > event.attendees ? (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button 
                  size="sm" 
                  className="w-full gradient-primary text-white shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={() => onClaimTicket?.(event.id)}
                >
                  <Ticket className="h-4 w-4 mr-1" />
                  {event.ticketType === 'free' ? 'Claim Ticket' : 'Buy Ticket'}
                </Button>
              </motion.div>
            ) : event.hasTicket ? (
              <Button size="sm" className="flex-1 gradient-secondary text-white" disabled>
                <Ticket className="h-4 w-4 mr-1" />
                Ticket Claimed
              </Button>
            ) : (
              <Button size="sm" className="flex-1" disabled variant="secondary">
                Sold Out
              </Button>
            )}
          </>
        )}

        {userRole === 'organizer' && (
          <>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full transition-all duration-200 hover:border-primary/50"
                onClick={() => onViewDetails?.(event.id)}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Analytics
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button 
                size="sm" 
                className="w-full gradient-primary text-white shadow-md hover:shadow-lg transition-all duration-200"
                onClick={() => onEdit?.(event.id)}
              >
                Edit Event
              </Button>
            </motion.div>
          </>
        )}

        {userRole === 'admin' && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full transition-all duration-200 hover:border-primary/50"
              onClick={() => onViewDetails?.(event.id)}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Review Event
            </Button>
          </motion.div>
        )}
      </CardFooter>
    </Card>
    </motion.div>
  );
}