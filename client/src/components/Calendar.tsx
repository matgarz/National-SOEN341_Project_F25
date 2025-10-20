import '@schedule-x/theme-shadcn/dist/index.css';
import { ScheduleXCalendar } from '@schedule-x/react';
import { useCalendarApp } from '@schedule-x/react';

import { createEventsServicePlugin } from '@schedule-x/events-service';
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
import { createEventModalPlugin } from '@schedule-x/event-modal';

import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar';
import 'temporal-polyfill/global';
import '@schedule-x/theme-default/dist/index.css';
import { useState } from 'react';
import type { Event } from './EventCard'; // type-only import
import BrowseEvents from './BrowseEvents';


export default function Calendar() {
  const dragAndDrop = createDragAndDropPlugin();
  const eventModal = createEventModalPlugin();

  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  
  const mappedEvents = calendarEvents.map(ev => {
    const startISO = typeof ev.start == 'string' ? ev.start : String(ev.start);
    const start = Temporal.Instant.from(startISO).toZonedDateTimeISO('UTC');
    const end = start.add({ hours: 2});

    return {
      id: ev.id.toString(),
      title: ev.title,
      start,
      end,
    };
  });

  const eventsService = createEventsServicePlugin();

  const calendar = useCalendarApp({
      plugins: [eventsService, eventModal, dragAndDrop],
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
    ],
  events: mappedEvents,
  });     

  const handleAddToCalendar = (ev: Event) => {
    console.log('Saving to calendar: ', ev);
    
    if(!ev.start) {
       console.error('Event missing start time:', ev);
       return;
    }
    const start = Temporal.Instant.from(ev.start.toString()).toZonedDateTimeISO('UTC');
    const end = start.add({ hours: 2 });

    const calendarEvent = {
      id: ev.id.toString(),
      title: ev.title,
      start,
      end,
    };
    
if (calendar?.events?.add && typeof calendar.events.add === 'function') {
      calendar.events.add(calendarEvent);
    } else {
      console.error('calendar.events.add is not available');
    }

    setCalendarEvents(prev => [...prev, calendarEvent]);
  };

  return (
    <div>
      <div id="calendario" className="mb-6">
        <ScheduleXCalendar calendarApp={calendar} />
      </div>

<div className="mt-6">
<h2 className="text-xl font-bold mb-2">Upcoming Events</h2>

<BrowseEvents
onAddToCalendar={handleAddToCalendar}
/>
</div>
</div>
);
}
