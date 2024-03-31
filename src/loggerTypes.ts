
export type DataLogLine = {
    type: 'outgoing' | 'incoming'
    data: string
    time: number
}

export type LogLine = {
    type: 'valorant-xmpp-logger'
    version: string
} | {
    type: 'open-valorant'
    host: string
    port: number
    sockedID: number
    time: number
} | {
    type: 'open-riot' | 'close-riot' | 'close-valorant'
    sockedID: number
    time: number
} | DataLogLine

export function isDataLogLine(line: LogLine): line is DataLogLine {
    return line.type === 'incoming' || line.type === 'outgoing'
}