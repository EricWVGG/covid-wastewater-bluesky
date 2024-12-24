export const abbreviateMonths = (input: string) =>
  input
    .replaceAll("January", "Jan")
    .replaceAll("February", "Feb")
    .replaceAll("March", "Mar")
    .replaceAll("April", "Apr")
    .replaceAll("June", "Jun")
    .replaceAll("July", "Jul")
    .replaceAll("August", "Aug")
    .replaceAll("September", "Sep")
    .replaceAll("October", "Oct")
    .replaceAll("November", "Nov")
    .replaceAll("December", "Dec")
