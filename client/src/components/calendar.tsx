import React, {useState, useEffect} from 'react';
import { Button } from '@/components/ui/button';
import '@schedule-x/theme-shadcn/dist/index.css'
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import { createCalendar } from '@schedule-x/calendar';
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop' 
import { createEventModalPlugin } from '@schedule-x/event-modal';
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import 'temporal-polyfill/global'
import '@schedule-x/theme-default/dist/index.css'

export default function CalendarApp() {
  const eventsService = useState(() => createEventsServicePlugin())[0]
 
  var calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    events: [
      {
        id: '1',
        title: 'Nationa brothers',
        start: Temporal.ZonedDateTime.from(
          {
            timeZone: "-00:00",
            year: 2025,
            month: 10,
            day: 7,
            hour: 12,
            minute: 34,
            second: 56,
           }),
        end: Temporal.ZonedDateTime.from( {
            timeZone: "-00:00",
            year: 2025,
            month: 10,
            day: 7,
            hour: 13,
            minute: 34,
            second: 56,
           }),
      },
    ],
    plugins: [eventsService, createDragAndDropPlugin, createEventModalPlugin ]
  })
 
  useEffect(() => {
    // get all events
    eventsService.getAll()
  }, [])
 
  return (
    <div id="calendario">
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  )
}



