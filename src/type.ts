export default function Type(data: any): string {
    return Object.prototype.toString.call(data).slice(8, -1).toLowerCase();
}
