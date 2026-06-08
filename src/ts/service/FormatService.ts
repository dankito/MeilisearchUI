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

  formatNumber(numberOfDocuments: number): string {
    return numberOfDocuments.toLocaleString()
  }

  formatBytes(bytes: number): string {
    const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    let i = 0
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024
      i++
    }
    return `${bytes.toFixed(2)} ${units[i]}`
  }

}