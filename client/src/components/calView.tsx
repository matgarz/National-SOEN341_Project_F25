import {useState} from 'react'
import CalendarApp from './calendar';
import { Button } from './ui/button';



export default function ViewCal() {
const [view, setv] = useState(false);
const v = () => setv(!view);
    return (
    <>
    {
    !view &&
    <Button onClick={v} 
    className='absolute size-32  bottom-40 left-40 slate-500' 
    size="lg" variant="outline">CALENDAR</Button>
    }
    {
    view &&
    <>
    <Button onClick={v} 
    className='absolute size-32 bottom-40 left-40 slate-500' 
    size="lg" variant="outline">EXIT</Button>
    <CalendarApp/>
    </>
    }
    </>
    )
}

