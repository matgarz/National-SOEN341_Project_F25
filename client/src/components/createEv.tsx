import { createEventsServicePlugin } from '@schedule-x/events-service'
const eventsServicePlugin = createEventsServicePlugin();

export type EventProps = {
    Title: string,
    starttime: Temporal.ZonedDateTime,
    endtime: Temporal.ZonedDateTime,
    Id: string,
    Description: string,
    Location: string,
    Organization: string,
}
export default function createEvent({
                                     Title,
                                     starttime,
                                     endtime,
                                     Id, 
                                     Description,
                                     Location,
                                     Organization}: EventProps){
        eventsServicePlugin.add({
            title: Title,
            start: starttime,
            end: endtime,
            id: Id,
            description: Description,
            location: Location,
            organization: Organization

        })


}