import { X, Calendar, Clock, MapPin, Users, Tag, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/badge";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Fix for default marker icon in React Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export interface EventDetails {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  category: string;
  ticketType: "free" | "paid";
  price?: number;
  capacity: number;
  attendees: number;
  image: string;
  tags: string[];
}

interface EventDetailsModalProps {
  event: EventDetails;
  isOpen: boolean;
  onClose: () => void;
  onClaimTicket?: (eventId: string) => void;
  userRole?: string;
}

// Simple geocoding function (you can enhance this with a real geocoding API)
const getCoordinatesFromLocation = async (location: string): Promise<[number, number]> => {
  // Default to Montreal coordinates
  const defaultCoords: [number, number] = [45.5017, -73.5673];
  
  // Simple location matching for common venues (you can expand this)
  const locationMap: Record<string, [number, number]> = {
    "H-110": [45.4972, -73.5790], // Concordia Hall Building
    "Building A": [45.4950, -73.5790],
    "Espace CDPQ Montreal": [45.5088, -73.5540],
    "EV Building": [45.4953, -73.5784],
    "MB Building": [45.4970, -73.5791],
  };

  // Check if we have a predefined location
  for (const [key, coords] of Object.entries(locationMap)) {
    if (location.toLowerCase().includes(key.toLowerCase())) {
      return coords;
    }
  }

  return defaultCoords;
};

export function EventDetailsModal({ 
  event, 
  isOpen, 
  onClose, 
  onClaimTicket,
  userRole = "student" 
}: EventDetailsModalProps) {
  const [mapCoords, setMapCoords] = useState<[number, number]>([45.5017, -73.5673]);

  useEffect(() => {
    if (isOpen && event.location) {
      getCoordinatesFromLocation(event.location).then(setMapCoords);
    }
  }, [isOpen, event.location]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Academic: "bg-blue-100 text-blue-800",
      Social: "bg-green-100 text-green-800",
      Sports: "bg-orange-100 text-orange-800",
      Cultural: "bg-purple-100 text-purple-800",
      Career: "bg-gray-100 text-gray-800",
      Workshop: "bg-yellow-100 text-yellow-800",
      General: "bg-gray-100 text-gray-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getAvailabilityStatus = () => {
    const remaining = event.capacity - event.attendees;
    if (remaining === 0) return { text: "Sold Out", color: "text-red-600" };
    if (remaining < 10)
      return { text: `Only ${remaining} spots left!`, color: "text-orange-600" };
    return { text: `${remaining} spots available`, color: "text-green-600" };
  };

  const availability = getAvailabilityStatus();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header with Image */}
              <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600">
                {event.image && event.image !== "https://via.placeholder.com/640x360?text=Event" && (
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-800" />
                </button>

                {/* Title overlay */}
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(event.category)}>
                      {event.category}
                    </Badge>
                    {event.ticketType === "free" ? (
                      <Badge className="bg-green-100 text-green-800">Free Event</Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800">${event.price}</Badge>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-white">{event.title}</h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">About This Event</h3>
                  <p className="text-gray-700 leading-relaxed">{event.description}</p>
                </div>

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Date & Time</p>
                      <p className="text-gray-700">{formatDate(event.date)}</p>
                      <p className="text-gray-600 text-sm">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Location</p>
                      <p className="text-gray-700">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Attendance</p>
                      <p className="text-gray-700">{event.attendees} attending</p>
                      <p className={`text-sm ${availability.color}`}>{availability.text}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Tag className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Organized By</p>
                      <p className="text-gray-700">{event.organizer}</p>
                    </div>
                  </div>

                  {event.ticketType === "paid" && (
                    <div className="flex items-start space-x-3">
                      <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900">Ticket Price</p>
                        <p className="text-gray-700">${event.price}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Map */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">Event Location</h3>
                  <div className="h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                    <MapContainer
                      center={mapCoords}
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={mapCoords}>
                        <Popup>
                          <strong>{event.title}</strong>
                          <br />
                          {event.location}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {userRole === "student" && onClaimTicket && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={onClose}
                    >
                      Close
                    </Button>
                    {event.capacity > event.attendees && (
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                        onClick={() => {
                          onClaimTicket(event.id);
                          onClose();
                        }}
                      >
                        {event.ticketType === "free" ? "Claim Free Ticket" : `Buy Ticket - $${event.price}`}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
