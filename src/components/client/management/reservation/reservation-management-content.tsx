import { TitleList } from '@/components/common'
import { ReservationsView } from './comps'


export function ReservationManagementContent() {
  return (
    <div className='space-y-6'>
        <div data-tour="reservations-header">
          <TitleList title="Gestão de reservas" suTitle="Gerir as reservas através do calendário." />
        </div>
        <div data-tour="reservations-calendar">
          <ReservationsView/>
        </div>
    </div>
  )
}
