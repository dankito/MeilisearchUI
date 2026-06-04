export class FormatService {

  formatDate(date: Date | string | number): string {
    if (typeof date === "string") {
      return this.formatDateObject(new Date(date))
    } else if (typeof date === "number") {
      return this.formatDateObject(new Date(date))
    } else {
      return this.formatDateObject(date)
    }
  }

  formatDateObject(date: Date): string {
    return date.toLocaleString()
  }

}