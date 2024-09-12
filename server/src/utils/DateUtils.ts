import dayjs from 'dayjs'

export function getStartOfWeek() {
  return dayjs().startOf('week').toDate()
}

export function getEndOfWeek() {
  return dayjs().endOf('week').toDate()
}
